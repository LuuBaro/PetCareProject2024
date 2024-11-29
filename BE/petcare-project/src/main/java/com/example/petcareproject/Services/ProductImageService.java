package com.example.petcareproject.Services;

import com.example.petcareproject.Model.ProductImage;
import com.example.petcareproject.Repository.ProductImageRepository;
import org.springframework.beans.factory.annotation.Autowired;

public class ProductImageService {

    @Autowired
    private ProductImageRepository productImageRepository;

    public void saveProductImage(ProductImage productImage) {
        productImageRepository.save(productImage);
    }

    public ProductImage getProductImageById(Long id) {
        return productImageRepository.findById(id).get();
    }

    public void deleteProductImageById(Long id) {
        productImageRepository.deleteById(id);
    }

    public void deleteProductImage(ProductImage productImage) {
        productImageRepository.delete(productImage);
    }

    public void deleteAllProductImages() {
        productImageRepository.deleteAll();
    }

    public Iterable<ProductImage> getAllProductImages() {
        return productImageRepository.findAll();
    }

}
