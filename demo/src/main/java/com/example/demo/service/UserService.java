package com.example.demo.service;

import com.example.demo.model.User;

public interface UserService {
    void register(User user);
    boolean authenticate(String username, String password);

}
