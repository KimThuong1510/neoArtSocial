package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.example.demo.model.User;
import com.example.demo.service.UserService;

import jakarta.validation.Valid;

@Controller
public class AutherController {
    @Autowired
    private UserService userService;

    @GetMapping("/")
    public String redirectToAuth() {
        return "redirect:/auth";
    }

    // Hiển thị trang Login/Signup (File HTML của bạn)
    @GetMapping("/auth")
    public String showAuthPage( Model model,
                                @RequestParam(value = "error", required = false) String error,
                                @RequestAttribute(value ="logout", required = false) String logout,
                                @RequestParam(value = "signupSuccess", required = false) String signupSuccess) {
        if (!model.containsAttribute("user")) {
             model.addAttribute("user", new User());
        }
         
        if (error != null) {
             model.addAttribute("errorMessage", "Sai tài khoản hoặc mật khẩu!");
        }
         
        if (logout != null) {
             model.addAttribute("logoutMessage", "Đã đăng xuất thành công!");
        }
         
        return "loginPage";
    }

    // Xu ly dang ky
    @PostMapping("/signup")
    public String handleSignup( @Valid @ModelAttribute("user") User user, 
                                BindingResult bindingResult,
                                Model model,
                                RedirectAttributes redirectAttributes) {
        if (bindingResult.hasErrors()) {
             return "loginPage";
        }
 
        try {
             userService.register(user);
             redirectAttributes.addFlashAttribute("signupSuccess", true);
             return "redirect:/auth";
        } catch (RuntimeException e) {
             model.addAttribute("registrationError", e.getMessage());
             return "loginPage";
         }
    }

//    @GetMapping("/feedPage")
//    public String showDashboard() {
//        return "feedPage/feedHome";
//    }

}
