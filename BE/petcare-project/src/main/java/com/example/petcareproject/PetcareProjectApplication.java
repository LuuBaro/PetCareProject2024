package com.example.petcareproject;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync(proxyTargetClass = true)
public class PetcareProjectApplication {

    public static void main(String[] args) {
        SpringApplication.run(PetcareProjectApplication.class, args);
    }

}
