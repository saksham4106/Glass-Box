package com.saksham4106.glassboxbackend.controller;


import com.saksham4106.glassboxbackend.dto.CodeRequest;
import com.saksham4106.glassboxbackend.dto.ExecutionResponse;
import com.saksham4106.glassboxbackend.service.ExecutionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "http://localhost:5173")
public class ExecutionController {

    private final ExecutionService service;

    public ExecutionController(ExecutionService service) {
        this.service = service;
    }

    @PostMapping("/execute")
    public ResponseEntity<ExecutionResponse> execute(@RequestBody CodeRequest executionRequest) {
        if(executionRequest.getCode() == null || executionRequest.getCode().isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        try{
            String out = service.executeCode(executionRequest.getCode());
            return ResponseEntity.ok(new ExecutionResponse(out, true, null));
        }catch(Exception e){
            return ResponseEntity.ok(new ExecutionResponse(e.getMessage(), false, null));
        }


    }
}
