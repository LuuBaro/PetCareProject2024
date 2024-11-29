package com.example.petcareproject.Repository;


import com.example.petcareproject.Model.ProductDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductDetailRepository extends JpaRepository<ProductDetail, Long> {
    @Query("SELECT pd FROM ProductDetail pd WHERE pd.product.productId = :productId")
    ProductDetail findByProductId(@Param("productId") Long productId);

    @Modifying
    @Query("UPDATE ProductDetail pd SET pd.quantity = :quantity WHERE pd.product.productId = :productId")
    void updateProductDetailQuantity(@Param("productId") Long productId, @Param("quantity") int quantity);

    // New query to find ProductDetail by ProductColorId
    @Query("SELECT pd FROM ProductDetail pd WHERE pd.productColor.productColorId = :colorId")
    ProductDetail findByProductColorId(@Param("colorId") Long colorId);

    // New query to update the ProductColor of a ProductDetail
    @Modifying
    @Query("UPDATE ProductDetail pd SET pd.productColor.productColorId = :colorId WHERE pd.product.productId = :productId")
    void updateProductDetailColor(@Param("productId") Long productId, @Param("colorId") Long colorId);

    @Query("SELECT pd FROM ProductDetail pd WHERE pd.product.productId = :productId")
    List<ProductDetail> findAllByProductId(@Param("productId") Long productId);


}
