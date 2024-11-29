package com.example.petcareproject.Controller;

import com.example.petcareproject.Model.ProductColor;
import com.example.petcareproject.Services.ProductColorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/product-colors")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductColorController {

    @Autowired
    private ProductColorService productColorService;

    // Get all product colors
    @GetMapping
    public ResponseEntity<List<ProductColor>> getAllProductColors() {
        List<ProductColor> productColors = productColorService.getAllProductColors();
        return new ResponseEntity<>(productColors, HttpStatus.OK);
    }

    // Get a product color by ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductColor> getProductColorById(@PathVariable Long id) {
        Optional<ProductColor> productColor = productColorService.getProductColorById(id);
        return productColor.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Create a new product color
    @PostMapping
    public ResponseEntity<ProductColor> createProductColor(@RequestBody ProductColor productColor) {
        ProductColor savedProductColor = productColorService.saveProductColor(productColor);
        return new ResponseEntity<>(savedProductColor, HttpStatus.CREATED);
    }

    // Update an existing product color
    @PutMapping("/{id}")
    public ResponseEntity<ProductColor> updateProductColor(@PathVariable Long id, @RequestBody ProductColor productColorDetails) {
        try {
            ProductColor updatedProductColor = productColorService.updateProductColor(id, productColorDetails);
            return new ResponseEntity<>(updatedProductColor, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // Delete a product color by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductColor(@PathVariable Long id) {
        try {
            productColorService.deleteProductColor(id);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
