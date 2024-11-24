package com.example.petcareproject.Services;

import com.example.petcareproject.Model.ProductWeight;
import com.example.petcareproject.Repository.ProductWeightRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductWeightService {

    @Autowired
    private ProductWeightRepository productWeightRepository;

    // Create a new product weight
    public ProductWeight createProductWeight(ProductWeight productWeight) {
        return productWeightRepository.save(productWeight);
    }

    // Get all product weights
    public List<ProductWeight> getAllProductWeights() {
        return productWeightRepository.findAll();
    }

    // Get a product weight by its ID
    public Optional<ProductWeight> getProductWeightById(Long id) {
        return productWeightRepository.findById(id);
    }

    // Update a product weight
    public ProductWeight updateProductWeight(Long id, ProductWeight productWeight) {
        if (productWeightRepository.existsById(id)) {
            productWeight.setProductWeightId(id);
            return productWeightRepository.save(productWeight);
        }
        return null; // Or throw an exception if you want
    }

    // Delete a product weight by its ID
    public boolean deleteProductWeight(Long id) {
        if (productWeightRepository.existsById(id)) {
            productWeightRepository.deleteById(id);
            return true;
        }
        return false; // Or throw an exception if you want
    }
}
