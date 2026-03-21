package com.example.demo.service;

import com.example.demo.dto.PasswordChangeRequest;
import com.example.demo.model.User;

public interface UserService {
    void register(User user);
    boolean authenticate(String username, String password);
    void changePassword(String username, PasswordChangeRequest request);

}
