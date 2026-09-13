package com.peertutor.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * WebConfig — Configures static resource handling for uploaded profile images & files.
 * Maps the URL path /uploads/** to both the local directory "file:uploads/" and user.home/peertutor/uploads/.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String userHomeUploadDir = System.getProperty("user.home") + "/peertutor/uploads/";
        Path userHomePath = Paths.get(userHomeUploadDir).toAbsolutePath();
        String userHomeLocation = "file:" + userHomePath.toString().replace("\\", "/") + "/";

        Path localPath = Paths.get("uploads").toAbsolutePath();
        String localLocation = "file:" + localPath.toString().replace("\\", "/") + "/";

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/", localLocation, userHomeLocation);
    }
}

