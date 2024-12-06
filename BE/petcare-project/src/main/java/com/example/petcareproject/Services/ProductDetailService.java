package com.example.petcareproject.Services;

import com.example.petcareproject.Model.ProductDetail;
import com.example.petcareproject.Repository.ProductDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductDetailService {

    @Autowired
    private ProductDetailRepository productDetailRepository;

    // Create or Update a ProductDetail
    public ProductDetail createProductDetail(ProductDetail productDetail) {
        // Save the new product detail to the database
        return productDetailRepository.save(productDetail);
    }

    public ProductDetail updateProductDetail(Long productDetailId, ProductDetail updatedProductDetail) {
        // Find the existing ProductDetail by ID
        Optional<ProductDetail> existingProductDetailOpt = productDetailRepository.findById(productDetailId);

        if (existingProductDetailOpt.isPresent()) {
            ProductDetail existingProductDetail = existingProductDetailOpt.get();

            // Update only the fields that are not null in updatedProductDetail
            if (updatedProductDetail.getQuantity() != 0) {
                existingProductDetail.setQuantity(updatedProductDetail.getQuantity());
            }
            if (updatedProductDetail.getPrice() != 0) {
                existingProductDetail.setPrice(updatedProductDetail.getPrice());
            }
            if (updatedProductDetail.getStatus() != null) {
                existingProductDetail.setStatus(updatedProductDetail.getStatus());
            }
            if (updatedProductDetail.getProduct() != null) {
                existingProductDetail.setProduct(updatedProductDetail.getProduct());
            }
            if (updatedProductDetail.getProductColor() != null) {
                existingProductDetail.setProductColor(updatedProductDetail.getProductColor());
            }
            if (updatedProductDetail.getProductSize() != null) {
                existingProductDetail.setProductSize(updatedProductDetail.getProductSize());
            }
            if (updatedProductDetail.getProductWeight() != null) {
                existingProductDetail.setProductWeight(updatedProductDetail.getProductWeight());
            }

            // Save the updated product detail
            return productDetailRepository.save(existingProductDetail);
        } else {
            throw new RuntimeException("ProductDetail with ID " + productDetailId + " not found.");
        }
    }
    // Get all ProductDetails
    public List<ProductDetail> getAllProductDetails() {
        return productDetailRepository.findAll();
    }

    // Get a ProductDetail by ID
    public Optional<ProductDetail> getProductDetailById(Long id) {
        return productDetailRepository.findById(id);
    }

    public Optional<ProductDetail> getProductColorById(Long id) {
        return productDetailRepository.findById(id);
    }

    // Delete a ProductDetail by ID
    public void deleteProductDetail(Long id) {
        productDetailRepository.deleteById(id);
    }


    public ProductDetail getProductDetailByProductId(Long productId) {
        return productDetailRepository.findByProductId(productId);
    }

    public void updateQuantity(Long productId, int newQuantity) {
        productDetailRepository.updateProductDetailQuantity(productId, newQuantity);
    }


    public List<ProductDetail> getProductDetailsByProductId(Long productId) {
        return productDetailRepository.findAllByProductId(productId);
    }

    public boolean existsById(Long id) {
        return productDetailRepository.existsById(id);
    }
}
