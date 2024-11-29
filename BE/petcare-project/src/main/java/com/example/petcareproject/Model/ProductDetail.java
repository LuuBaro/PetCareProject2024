package com.example.petcareproject.Model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "product_details")
public class ProductDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productDetailId;
    private int quantity;
    private double price;
    private Boolean status;


    @ManyToOne
    @JoinColumn(name = "productId")
    private Product product;

    @ManyToOne
    @JoinColumn(name = "productColorId")
    private ProductColor productColor;

    @ManyToOne
    @JoinColumn(name = "productSizeId")
    private ProductSize productSize;

    @ManyToOne
    @JoinColumn(name = "productWeightId")
    private ProductWeight productWeight;

}
