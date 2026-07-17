package com.saksham4106.glassboxbackend.dto;

public class ExecutionResponse {
    private final String output;
    private final boolean success;
    private final String errorMessage;

    public ExecutionResponse(String output, boolean success, String errorMessage) {
        this.output = output;
        this.success = success;
        this.errorMessage = errorMessage;
    }

    // Getters
    public String getOutput() { return output; }
    public boolean isSuccess() { return success; }
    public String getErrorMessage() { return errorMessage; }
}
