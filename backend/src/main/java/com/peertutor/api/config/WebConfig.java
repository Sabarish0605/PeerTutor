package com.peertutor.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * WebConfig — standard MVC config.
 * Static resource handling for /uploads/** is centrally handled in WebMvcConfig.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
}

