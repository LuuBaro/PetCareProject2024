package com.example.petcareproject.Config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public ThreadPoolTaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5); // Số luồng tối thiểu
        executor.setMaxPoolSize(50); // Số luồng tối đa
        executor.setQueueCapacity(25); // Hàng đợi
        executor.setThreadNamePrefix("Async-");
        executor.initialize();
        return executor;
    }
}