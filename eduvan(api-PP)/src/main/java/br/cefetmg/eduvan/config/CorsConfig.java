package br.cefetmg.eduvan.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    public CorsConfig() {
        System.out.println("=== CORS CONFIG CARREGADO ===");
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                System.out.println("=== CONFIGURANDO CORS MAPPINGS ===");
                
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:8100")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(false)
                        .maxAge(3600);
                
                System.out.println("=== CORS CONFIGURADO PARA: http://localhost:8100 ===");
            }
        };
    }
}