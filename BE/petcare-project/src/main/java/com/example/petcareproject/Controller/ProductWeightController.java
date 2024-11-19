package com.example.petcareproject.Controller;

import com.example.petcareproject.Model.ProductWeight;
import com.example.petcareproject.Services.ProductWeightService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/product-weights")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductWeightController {

    @Autowired
    private ProductWeightService productWeightService;

    // Get all product weights
    @GetMapping
    public List<ProductWeight> getAllProductWeights() {
        return productWeightService.getAllProductWeights();
    }

    // Get a product weight by ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductWeight> getProductWeightById(@PathVariable Long id) {
        Optional<ProductWeight> productWeight = productWeightService.getProductWeightById(id);
        return productWeight.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Create a new product weight
    @PostMapping
    public ResponseEntity<ProductWeight> createProductWeight(@RequestBody ProductWeight productWeight) {
        ProductWeight createdProductWeight = productWeightService.createProductWeight(productWeight);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProductWeight);
    }

    // Update an existing product weight
    @PutMapping("/{id}")
    public ResponseEntity<ProductWeight> updateProductWeight(
            @PathVariable Long id, @RequestBody ProductWeight productWeight) {
        ProductWeight updatedProductWeight = productWeightService.updateProductWeight(id, productWeight);
        return updatedProductWeight != null
                ? ResponseEntity.ok(updatedProductWeight)
                : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    // Delete a product weight
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductWeight(@PathVariable Long id) {
        boolean isDeleted = productWeightService.deleteProductWeight(id);
        return isDeleted ? ResponseEntity.noContent().build() : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
