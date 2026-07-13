package com.aitinerary;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class AiTineraryApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiTineraryApplication.class, args);
    }
}
