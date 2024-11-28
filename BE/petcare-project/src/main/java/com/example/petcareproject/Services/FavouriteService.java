package com.example.petcareproject.Service;

import com.example.petcareproject.Model.Favourite;
import com.example.petcareproject.Model.Product;
import com.example.petcareproject.Model.User;
import com.example.petcareproject.Repository.FavouriteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FavouriteService {

    private final FavouriteRepository favouriteRepository;

    @Autowired
    public FavouriteService(FavouriteRepository favouriteRepository) {
        this.favouriteRepository = favouriteRepository;
    }

    // Get all favourites for a user
    public List<Favourite> getFavouritesByUser(User user) {
        return favouriteRepository.findByUser(user);
    }

    // Get all favourites for a product
    public List<Favourite> getFavouritesByProduct(Product product) {
        return favouriteRepository.findByProduct(product);
    }

    // Get a specific favourite by user and product
    public Optional<Favourite> getFavouriteByUserAndProduct(User user, Product product) {
        return Optional.ofNullable(favouriteRepository.findByUserAndProduct(user, product));
    }

    // Add a favourite or update it
    public Favourite addOrUpdateFavourite(Favourite favourite) {
        Favourite existingFavourite = favouriteRepository.findByUserAndProduct(favourite.getUser(), favourite.getProduct());
        if (existingFavourite != null) {
            existingFavourite.setLiked(favourite.isLiked());
            existingFavourite.setLikeDate(favourite.getLikeDate());
            return favouriteRepository.save(existingFavourite);
        }

        return favouriteRepository.save(favourite);
    }


    // Remove a favourite by ID
    public void removeFavourite(Long id) {
        favouriteRepository.deleteById(id);
    }

    // Remove a specific favourite by user and product
    public void removeFavouriteByUserAndProduct(User user, Product product) {
        Favourite favourite = favouriteRepository.findByUserAndProduct(user, product);
        if (favourite != null) {
            favouriteRepository.delete(favourite);
        }
    }
}
