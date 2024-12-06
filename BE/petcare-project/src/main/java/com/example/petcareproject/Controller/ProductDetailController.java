package com.example.petcareproject.Controller;

import com.example.petcareproject.Model.ProductDetail;
import com.example.petcareproject.Repository.ProductDetailRepository;
import com.example.petcareproject.Services.ProductDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/product-details")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductDetailController {

    @Autowired
    private ProductDetailService productDetailService;

    @Autowired
    private ProductDetailRepository productDetailRepository;

    // Create or Update a ProductDetail

    @PostMapping
    public ProductDetail createProductDetail(@RequestBody ProductDetail productDetail) {
        return productDetailService.createProductDetail(productDetail);
    }


    @PutMapping("/{productDetailId}")
    public ProductDetail updateProductDetail(@PathVariable Long productDetailId, @RequestBody ProductDetail updatedProductDetail) {
        return productDetailService.updateProductDetail(productDetailId, updatedProductDetail);
    }

    // Get all ProductDetails
    @GetMapping
    public ResponseEntity<List<ProductDetail>> getAllProductDetails() {
        List<ProductDetail> productDetails = productDetailService.getAllProductDetails();
        return new ResponseEntity<>(productDetails, HttpStatus.OK);
    }

    // Get a ProductDetail by ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductDetail> getProductDetailById(@PathVariable Long id) {
        Optional<ProductDetail> productDetail = productDetailService.getProductDetailById(id);
        if (productDetail.isPresent()) {
            return new ResponseEntity<>(productDetail.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a ProductDetail by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductDetail(@PathVariable Long id) {
        Optional<ProductDetail> productDetail = productDetailService.getProductDetailById(id);
        if (productDetail.isPresent()) {
            productDetailService.deleteProductDetail(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/by-product/{productId}")
    public ResponseEntity<List<ProductDetail>> getAllProductDetailsByProductId(@PathVariable Long productId) {
        List<ProductDetail> productDetails = productDetailService.getProductDetailsByProductId(productId);
        if (!productDetails.isEmpty()) {
            return new ResponseEntity<>(productDetails, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{productDetailId}/status")
    public ProductDetail updateProductStatus(@PathVariable Long productDetailId, @RequestBody Map<String, Object> payload) {
        Boolean status = (Boolean) payload.get("status");

        if (status == null) {
            throw new IllegalArgumentException("Status must be provided.");
        }

        // Tìm sản phẩm hiện có
        ProductDetail existingProductDetail = productDetailRepository.findById(productDetailId)
                .orElseThrow(() -> new RuntimeException("ProductDetail with ID " + productDetailId + " not found."));

        // Cập nhật trạng thái
        existingProductDetail.setStatus(status);

        // Lưu sản phẩm đã cập nhật
        return productDetailRepository.save(existingProductDetail);
    }
}
