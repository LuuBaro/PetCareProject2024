package com.example.petcareproject.Services;

import com.example.petcareproject.Model.ProductColor;
import com.example.petcareproject.Repository.ProductColorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductColorService {

    @Autowired
    private ProductColorRepository productColorRepository;

    // Get all product colors
    public List<ProductColor> getAllProductColors() {
        return productColorRepository.findAll();
    }

    // Get product color by ID
    public Optional<ProductColor> getProductColorById(Long id) {
        return productColorRepository.findById(id);
    }

    // Save new product color
    public ProductColor saveProductColor(ProductColor productColor) {
        return productColorRepository.save(productColor);
    }

    // Delete product color by ID
    public void deleteProductColor(Long id) {
        if (productColorRepository.existsById(id)) {
            productColorRepository.deleteById(id);
        } else {
            throw new ResourceNotFoundException("ProductColor not found for this id :: " + id);
        }
    }

    // Update product color by ID
    public ProductColor updateProductColor(Long id, ProductColor productColorDetails) {
        ProductColor productColor = productColorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductColor not found for this id :: " + id));

        productColor.setColor(productColorDetails.getColor());
        productColor.setStatus(productColorDetails.getStatus());
        // Set other fields as required, if applicable

        return productColorRepository.save(productColor);
    }
}
