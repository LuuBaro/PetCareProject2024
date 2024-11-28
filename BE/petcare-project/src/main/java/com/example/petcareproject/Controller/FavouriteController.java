package com.example.petcareproject.Controller;

import com.example.petcareproject.Model.Favourite;
import com.example.petcareproject.Model.Product;
import com.example.petcareproject.Model.User;
import com.example.petcareproject.Service.FavouriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/favourites")
public class FavouriteController {

    private final FavouriteService favouriteService;

    @Autowired
    public FavouriteController(FavouriteService favouriteService) {
        this.favouriteService = favouriteService;
    }

    // Get all favourites by user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Favourite>> getFavouritesByUser(@PathVariable Long userId) {
        User user = new User();
        user.setUserId(userId);
        List<Favourite> favourites = favouriteService.getFavouritesByUser(user);
        return ResponseEntity.ok(favourites);
    }

    // Get all favourites for a product
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Favourite>> getFavouritesByProduct(@PathVariable Long productId) {
        Product product = new Product();
        product.setProductId(productId);
        List<Favourite> favourites = favouriteService.getFavouritesByProduct(product);
        return ResponseEntity.ok(favourites);
    }

    // Get a specific favourite by user and product
    @GetMapping("/user/{userId}/product/{productId}")
    public ResponseEntity<Favourite> getFavouriteByUserAndProduct(
            @PathVariable Long userId,
            @PathVariable Long productId
    ) {
        User user = new User();
        user.setUserId(userId);

        Product product = new Product();
        product.setProductId(productId);

        Optional<Favourite> favourite = favouriteService.getFavouriteByUserAndProduct(user, product);
        return favourite.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }


    // Add a favourite or update it
    @PostMapping
    public ResponseEntity<Favourite> addOrUpdateFavourite(@RequestBody Favourite favourite) {
        Favourite savedFavourite = favouriteService.addOrUpdateFavourite(favourite);
        return ResponseEntity.ok(savedFavourite);
    }

    // Remove a favourite by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFavourite(@PathVariable Long id) {
        favouriteService.removeFavourite(id);
        return ResponseEntity.noContent().build();
    }

    // Remove a specific favourite by user and product
    @DeleteMapping("/user/{userId}/product/{productId}")
    public ResponseEntity<Void> removeFavouriteByUserAndProduct(
            @PathVariable Long userId,
            @PathVariable Long productId
    ) {
        User user = new User();
        user.setUserId(userId);

        Product product = new Product();
        product.setProductId(productId);

        favouriteService.removeFavouriteByUserAndProduct(user, product);
        return ResponseEntity.noContent().build();
    }
}
