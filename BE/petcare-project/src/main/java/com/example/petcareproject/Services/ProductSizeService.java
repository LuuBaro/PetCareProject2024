package com.example.petcareproject.Services;

import com.example.petcareproject.Model.ProductSize;
import com.example.petcareproject.Repository.ProductSizeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductSizeService {

    private final ProductSizeRepository productSizeRepository;

    @Autowired
    public ProductSizeService(ProductSizeRepository productSizeRepository) {
        this.productSizeRepository = productSizeRepository;
    }

    // Get all ProductSizes
    public List<ProductSize> getAllProductSizes() {
        return productSizeRepository.findAll();
    }

    // Get a ProductSize by ID
    public Optional<ProductSize> getProductSizeById(Long id) {
        return productSizeRepository.findById(id);
    }

    // Create a new ProductSize
    public ProductSize createProductSize(ProductSize productSize) {
        return productSizeRepository.save(productSize);
    }

    // Update an existing ProductSize
    public ProductSize updateProductSize(Long id, ProductSize updatedProductSize) {
        Optional<ProductSize> existingProductSize = productSizeRepository.findById(id);

        if (existingProductSize.isPresent()) {
            ProductSize productSize = existingProductSize.get();
            productSize.setProductSize(updatedProductSize.getProductSize());
            productSize.setStatus(updatedProductSize.getStatus());
            return productSizeRepository.save(productSize);
        } else {
            throw new IllegalArgumentException("ProductSize with ID " + id + " not found.");
        }
    }

    // Delete a ProductSize by ID
    public void deleteProductSize(Long id) {
        if (productSizeRepository.existsById(id)) {
            productSizeRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("ProductSize with ID " + id + " not found.");
        }
    }
}
