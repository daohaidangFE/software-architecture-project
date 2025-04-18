package com.kttkpm.model_management_service.Dto;


import org.springframework.core.io.Resource;

public class FileDownloadResponse {
    private final Resource resource;
    private final String suggestedFilename;

    public FileDownloadResponse(Resource resource, String suggestedFilename) {
        this.resource = resource;
        this.suggestedFilename = suggestedFilename;
    }

    public Resource getResource() {
        return resource;
    }

    public String getSuggestedFilename() {
        return suggestedFilename;
    }
}
