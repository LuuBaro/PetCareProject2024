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

    /**
     * Method to update a ProductDetail.
     * @param productDetailId The ID of the ProductDetail to update.
     * @param updatedProductDetail The ProductDetail object with updated information.
     * @return The updated ProductDetail object.
     */
    public ProductDetail updateProductDetail(Long productDetailId, ProductDetail updatedProductDetail) {
        // Find the existing ProductDetail by ID
        Optional<ProductDetail> existingProductDetailOpt = productDetailRepository.findById(productDetailId);

        if (existingProductDetailOpt.isPresent()) {
            ProductDetail existingProductDetail = existingProductDetailOpt.get();

            // Update the fields with the new values
            existingProductDetail.setQuantity(updatedProductDetail.getQuantity());
            existingProductDetail.setPrice(updatedProductDetail.getPrice());
            existingProductDetail.setStatus(updatedProductDetail.getStatus());
            existingProductDetail.setProduct(updatedProductDetail.getProduct());
            existingProductDetail.setProductColor(updatedProductDetail.getProductColor());
            existingProductDetail.setProductSize(updatedProductDetail.getProductSize());
            existingProductDetail.setProductWeight(updatedProductDetail.getProductWeight());

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
}
