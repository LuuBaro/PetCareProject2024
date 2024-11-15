package com.example.petcareproject.Controller;

import com.example.petcareproject.Model.ProductSize;
import com.example.petcareproject.Services.ProductSizeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/product-sizes")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductSizeController {

    private final ProductSizeService productSizeService;

    @Autowired
    public ProductSizeController(ProductSizeService productSizeService) {
        this.productSizeService = productSizeService;
    }

    // Get all product sizes
    @GetMapping
    public ResponseEntity<List<ProductSize>> getAllProductSizes() {
        List<ProductSize> productSizes = productSizeService.getAllProductSizes();
        return new ResponseEntity<>(productSizes, HttpStatus.OK);
    }

    // Get a product size by ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductSize> getProductSizeById(@PathVariable Long id) {
        Optional<ProductSize> productSize = productSizeService.getProductSizeById(id);
        return productSize.map(size -> new ResponseEntity<>(size, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Create a new product size
    @PostMapping
    public ResponseEntity<ProductSize> createProductSize(@RequestBody ProductSize productSize) {
        ProductSize newProductSize = productSizeService.createProductSize(productSize);
        return new ResponseEntity<>(newProductSize, HttpStatus.CREATED);
    }

    // Update a product size by ID
    @PutMapping("/{id}")
    public ResponseEntity<ProductSize> updateProductSize(@PathVariable Long id, @RequestBody ProductSize updatedProductSize) {
        try {
            ProductSize productSize = productSizeService.updateProductSize(id, updatedProductSize);
            return new ResponseEntity<>(productSize, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a product size by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductSize(@PathVariable Long id) {
        try {
            productSizeService.deleteProductSize(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
