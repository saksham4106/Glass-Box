package com.saksham4106.glassboxbackend.service;


import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.command.CreateContainerResponse;
import com.github.dockerjava.api.model.Bind;
import com.github.dockerjava.api.model.HostConfig;
import com.github.dockerjava.api.model.Volume;
import com.github.dockerjava.core.DefaultDockerClientConfig;
import com.github.dockerjava.core.DockerClientImpl;
import com.github.dockerjava.transport.DockerHttpClient;
import com.github.dockerjava.zerodep.ZerodepDockerHttpClient;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class ExecutionService {

    private final DockerClient dockerClient;
    private final Path sandboxDir = Path.of(System.getProperty("user.dir"), "sandboxes");

    public ExecutionService(){
        DefaultDockerClientConfig config = DefaultDockerClientConfig.createDefaultConfigBuilder()
                .withDockerHost("unix:///var/run/docker.sock")
                .build();
        DockerHttpClient httpClient = new ZerodepDockerHttpClient.Builder()
                .dockerHost(config.getDockerHost())

                .sslConfig(config.getSSLConfig())
                .maxConnections(100)
                .build();

        this.dockerClient = DockerClientImpl.getInstance(config, httpClient);
    }

    public String executeCode(String code) throws Exception{
        String sessionId = UUID.randomUUID().toString();
        Path sessionDir = sandboxDir.resolve(sessionId);
        Path codeDir = sessionDir.resolve("code");
        Path outputDir = sessionDir.resolve("output");

        Files.createDirectories(outputDir);
        Files.createDirectories(codeDir);

        Path codeFile =  codeDir.resolve("Main.java");
        Files.writeString(codeFile, code);


        HostConfig hostConfig = HostConfig.newHostConfig()
                .withBinds(
                        new Bind(codeDir.toAbsolutePath().toFile().getAbsolutePath(), new Volume("/app/code")),
                        new Bind(outputDir.toAbsolutePath().toFile().getAbsolutePath(), new Volume("/app/output"))                )
                .withMemory(512 * 1024 * 1024L)
                .withNanoCPUs(1_000_000_000L)
                .withAutoRemove(false);


        CreateContainerResponse container = dockerClient.createContainerCmd("algo-sandbox")
                .withHostConfig(hostConfig)
                .withNetworkDisabled(true)
                .exec();

        String containerId = container.getId();


        try{
            dockerClient.startContainerCmd(containerId).exec();
            dockerClient.waitContainerCmd(containerId).start().awaitCompletion(10, TimeUnit.SECONDS);

            Path outputFile = outputDir.resolve("out.json");
            Path errFile = outputDir.resolve("err.json");

            if(Files.exists(outputFile)) {
                return Files.readString(outputFile);
            }else if(Files.exists(errFile)) {
                throw new Exception(Files.readString(errFile));
            }else{
                throw new Exception("Unhandled Error");
            }
        }finally {
            try{
                dockerClient.removeContainerCmd(containerId).withForce(true).exec();
            }catch (Exception e){}

            deleteDirectory(sessionDir.toFile());

        }
    }

    private void deleteDirectory(File directory) {
        File[] allContents = directory.listFiles();
        if (allContents != null) {
            for (File file : allContents) {
                deleteDirectory(file);
            }
        }
        directory.delete();
    }
}
