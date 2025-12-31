package br.cefetmg.eduvan.controller;

import br.cefetmg.eduvan.model.Admin;
import br.cefetmg.eduvan.repository.AdminRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admins")
public class AdminController {
    private final AdminRepository adminRepository;

    public AdminController(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    @GetMapping("/{id}")
    public Admin getAdmin(@PathVariable int id) {
        return adminRepository.findById(id);
    }

    @GetMapping
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    @DeleteMapping("/{id}")
    public void deleteAdmin(@PathVariable int id) {
        adminRepository.delete(id);
    }
}