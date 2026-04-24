package com.example.demo.repository;

import com.example.demo.model.SavedCollection;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavedCollectionRepository extends JpaRepository<SavedCollection, Long> {
    List<SavedCollection> findByUserOrderByCreatedAtDesc(User user);
}