package com.example.petcareproject.Model;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.context.annotation.Bean;
import org.springframework.validation.annotation.Validated;

@Data
@Entity
@Table(name = "brands")
public class Brand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long brandId;

    @Column(name = "brandName", columnDefinition = "NVARCHAR(255)")
    private String brandName;


}
