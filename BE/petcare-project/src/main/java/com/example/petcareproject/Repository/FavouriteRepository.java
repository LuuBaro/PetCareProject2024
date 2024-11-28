package com.example.petcareproject.Repository;

import com.example.petcareproject.Model.Favourite;
import com.example.petcareproject.Model.Product;
import com.example.petcareproject.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FavouriteRepository extends JpaRepository<Favourite, Long> {
    List<Favourite> findByUser(User user);
    List<Favourite> findByProduct(Product product);
    Favourite findByUserAndProduct(User user, Product product);  // No need to check `isLiked` in repo query
    List<Favourite> findByIsLiked(boolean isLiked);
}
