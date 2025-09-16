#!/usr/bin/env python3
"""
Backend API Testing Suite for WhatsApp Sticker Admin Panel
Tests authentication, admin profile, unified stickers, and Firebase configuration endpoints
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional

# Configuration
BACKEND_URL = "https://whatsapp-studio-1.preview.emergentagent.com/api"
DEFAULT_ADMIN_EMAIL = "admin@stickers.com"
DEFAULT_ADMIN_PASSWORD = "admin123"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, message: str, details: Optional[Dict] = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "details": details or {}
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_init_admin(self):
        """Test admin initialization endpoint"""
        try:
            response = self.session.post(f"{BACKEND_URL}/init-admin")
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "Admin Initialization", 
                    True, 
                    f"Admin initialization successful: {data.get('message', 'Unknown response')}"
                )
                return True
            else:
                self.log_test(
                    "Admin Initialization", 
                    False, 
                    f"Failed with status {response.status_code}",
                    {"response": response.text}
                )
                return False
                
        except Exception as e:
            self.log_test("Admin Initialization", False, f"Exception: {str(e)}")
            return False
    
    def test_admin_login(self):
        """Test admin login with default credentials"""
        try:
            login_data = {
                "email": DEFAULT_ADMIN_EMAIL,
                "password": DEFAULT_ADMIN_PASSWORD
            }
            
            response = self.session.post(f"{BACKEND_URL}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("token")
                
                if self.auth_token:
                    # Set authorization header for future requests
                    self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                    
                    self.log_test(
                        "Admin Login", 
                        True, 
                        f"Login successful for {data.get('email')} (ID: {data.get('id')})"
                    )
                    return True
                else:
                    self.log_test("Admin Login", False, "No token received in response")
                    return False
            else:
                self.log_test(
                    "Admin Login", 
                    False, 
                    f"Login failed with status {response.status_code}",
                    {"response": response.text}
                )
                return False
                
        except Exception as e:
            self.log_test("Admin Login", False, f"Exception: {str(e)}")
            return False
    
    def test_admin_profile_get(self):
        """Test getting admin profile"""
        if not self.auth_token:
            self.log_test("Admin Profile GET", False, "No auth token available")
            return False
            
        try:
            response = self.session.get(f"{BACKEND_URL}/admin/profile")
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "Admin Profile GET", 
                    True, 
                    f"Profile retrieved for {data.get('name')} ({data.get('email')})"
                )
                return True
            else:
                self.log_test(
                    "Admin Profile GET", 
                    False, 
                    f"Failed with status {response.status_code}",
                    {"response": response.text}
                )
                return False
                
        except Exception as e:
            self.log_test("Admin Profile GET", False, f"Exception: {str(e)}")
            return False
    
    def test_admin_profile_update(self):
        """Test updating admin profile"""
        if not self.auth_token:
            self.log_test("Admin Profile UPDATE", False, "No auth token available")
            return False
            
        try:
            update_data = {
                "name": "Test Admin Updated"
            }
            
            response = self.session.put(f"{BACKEND_URL}/admin/profile", json=update_data)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "Admin Profile UPDATE", 
                    True, 
                    f"Profile updated successfully: {data.get('name')}"
                )
                return True
            else:
                self.log_test(
                    "Admin Profile UPDATE", 
                    False, 
                    f"Failed with status {response.status_code}",
                    {"response": response.text}
                )
                return False
                
        except Exception as e:
            self.log_test("Admin Profile UPDATE", False, f"Exception: {str(e)}")
            return False
    
    def test_change_password(self):
        """Test password change endpoint"""
        if not self.auth_token:
            self.log_test("Change Password", False, "No auth token available")
            return False
            
        try:
            # Test with incorrect current password first
            password_data = {
                "current_password": "wrongpassword",
                "new_password": "newpassword123"
            }
            
            response = self.session.post(f"{BACKEND_URL}/admin/change-password", json=password_data)
            
            if response.status_code == 400:
                self.log_test(
                    "Change Password (Wrong Current)", 
                    True, 
                    "Correctly rejected wrong current password"
                )
            else:
                self.log_test(
                    "Change Password (Wrong Current)", 
                    False, 
                    f"Should have rejected wrong password but got status {response.status_code}"
                )
            
            # Test with correct current password
            password_data = {
                "current_password": DEFAULT_ADMIN_PASSWORD,
                "new_password": "newpassword123"
            }
            
            response = self.session.post(f"{BACKEND_URL}/admin/change-password", json=password_data)
            
            if response.status_code == 200:
                self.log_test(
                    "Change Password", 
                    True, 
                    "Password changed successfully"
                )
                
                # Change it back for other tests
                password_data = {
                    "current_password": "newpassword123",
                    "new_password": DEFAULT_ADMIN_PASSWORD
                }
                self.session.post(f"{BACKEND_URL}/admin/change-password", json=password_data)
                
                return True
            else:
                self.log_test(
                    "Change Password", 
                    False, 
                    f"Failed with status {response.status_code}",
                    {"response": response.text}
                )
                return False
                
        except Exception as e:
            self.log_test("Change Password", False, f"Exception: {str(e)}")
            return False
    
    def test_unified_stickers_get(self):
        """Test getting unified stickers"""
        if not self.auth_token:
            self.log_test("Unified Stickers GET", False, "No auth token available")
            return False
            
        try:
            # Test without filters
            response = self.session.get(f"{BACKEND_URL}/stickers")
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "Unified Stickers GET", 
                    True, 
                    f"Retrieved {len(data)} stickers"
                )
                
                # Test with platform filter
                response = self.session.get(f"{BACKEND_URL}/stickers?platform=ios")
                if response.status_code == 200:
                    ios_data = response.json()
                    self.log_test(
                        "Unified Stickers GET (iOS filter)", 
                        True, 
                        f"Retrieved {len(ios_data)} iOS stickers"
                    )
                
                # Test with platform filter
                response = self.session.get(f"{BACKEND_URL}/stickers?platform=android")
                if response.status_code == 200:
                    android_data = response.json()
                    self.log_test(
                        "Unified Stickers GET (Android filter)", 
                        True, 
                        f"Retrieved {len(android_data)} Android stickers"
                    )
                
                return True
            else:
                self.log_test(
                    "Unified Stickers GET", 
                    False, 
                    f"Failed with status {response.status_code}",
                    {"response": response.text}
                )
                return False
                
        except Exception as e:
            self.log_test("Unified Stickers GET", False, f"Exception: {str(e)}")
            return False
    
    def test_unified_stickers_create(self):
        """Test creating a unified sticker"""
        if not self.auth_token:
            self.log_test("Unified Stickers CREATE", False, "No auth token available")
            return False
            
        try:
            sticker_data = {
                "name": "Test Sticker",
                "description": "A test sticker for API testing",
                "category_id": "test-category-id",
                "files": {
                    "png": "https://example.com/test-sticker.png",
                    "webp": "https://example.com/test-sticker.webp"
                },
                "platforms": ["ios", "android"],
                "is_active": True,
                "is_premium": False,
                "file_size_mb": 0.5,
                "dimensions": "512x512"
            }
            
            response = self.session.post(f"{BACKEND_URL}/stickers", json=sticker_data)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "Unified Stickers CREATE", 
                    True, 
                    f"Created sticker: {data.get('sticker', {}).get('name', 'Unknown')}"
                )
                return True
            else:
                self.log_test(
                    "Unified Stickers CREATE", 
                    False, 
                    f"Failed with status {response.status_code}",
                    {"response": response.text}
                )
                return False
                
        except Exception as e:
            self.log_test("Unified Stickers CREATE", False, f"Exception: {str(e)}")
            return False
    
    def test_firebase_instructions(self):
        """Test Firebase instructions endpoint"""
        if not self.auth_token:
            self.log_test("Firebase Instructions", False, "No auth token available")
            return False
            
        try:
            response = self.session.get(f"{BACKEND_URL}/system/firebase-instructions")
            
            if response.status_code == 200:
                data = response.json()
                instructions = data.get("instructions", "")
                if instructions and len(instructions) > 100:  # Check if we got meaningful instructions
                    self.log_test(
                        "Firebase Instructions", 
                        True, 
                        f"Retrieved Firebase instructions ({len(instructions)} characters)"
                    )
                    return True
                else:
                    self.log_test(
                        "Firebase Instructions", 
                        False, 
                        "Instructions seem empty or too short"
                    )
                    return False
            else:
                self.log_test(
                    "Firebase Instructions", 
                    False, 
                    f"Failed with status {response.status_code}",
                    {"response": response.text}
                )
                return False
                
        except Exception as e:
            self.log_test("Firebase Instructions", False, f"Exception: {str(e)}")
            return False
    
    def test_firebase_config_test(self):
        """Test Firebase configuration test endpoint"""
        if not self.auth_token:
            self.log_test("Firebase Config Test", False, "No auth token available")
            return False
            
        try:
            response = self.session.post(f"{BACKEND_URL}/system/test-firebase")
            
            # This should fail initially since Firebase is not configured
            if response.status_code == 400:
                data = response.json()
                if "Firebase not configured" in data.get("detail", ""):
                    self.log_test(
                        "Firebase Config Test", 
                        True, 
                        "Correctly detected Firebase not configured"
                    )
                    return True
                else:
                    self.log_test(
                        "Firebase Config Test", 
                        False, 
                        f"Unexpected error message: {data.get('detail')}"
                    )
                    return False
            else:
                self.log_test(
                    "Firebase Config Test", 
                    False, 
                    f"Unexpected status code {response.status_code}",
                    {"response": response.text}
                )
                return False
                
        except Exception as e:
            self.log_test("Firebase Config Test", False, f"Exception: {str(e)}")
            return False
    
    def test_system_config(self):
        """Test system configuration endpoints"""
        if not self.auth_token:
            self.log_test("System Config GET", False, "No auth token available")
            return False
            
        try:
            # Test GET system config
            response = self.session.get(f"{BACKEND_URL}/system/config")
            
            if response.status_code == 200:
                data = response.json()
                features = data.get("features", {})
                self.log_test(
                    "System Config GET", 
                    True, 
                    f"Retrieved system config with {len(features)} feature toggles"
                )
                
                # Test PUT system config (update)
                update_data = data.copy()
                update_data["features"]["test_feature"] = True
                
                response = self.session.put(f"{BACKEND_URL}/system/config", json=update_data)
                
                if response.status_code == 200:
                    self.log_test(
                        "System Config PUT", 
                        True, 
                        "System config updated successfully"
                    )
                    return True
                else:
                    self.log_test(
                        "System Config PUT", 
                        False, 
                        f"Update failed with status {response.status_code}",
                        {"response": response.text}
                    )
                    return False
            else:
                self.log_test(
                    "System Config GET", 
                    False, 
                    f"Failed with status {response.status_code}",
                    {"response": response.text}
                )
                return False
                
        except Exception as e:
            self.log_test("System Config", False, f"Exception: {str(e)}")
            return False
    
    def test_dashboard_stats(self):
        """Test dashboard stats endpoint"""
        if not self.auth_token:
            self.log_test("Dashboard Stats", False, "No auth token available")
            return False
            
        try:
            response = self.session.get(f"{BACKEND_URL}/dashboard/stats")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["total_categories", "total_subcategories", "total_stickers", "recent_uploads"]
                
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_test(
                        "Dashboard Stats", 
                        True, 
                        f"Retrieved dashboard stats: {data.get('total_stickers', 0)} stickers, {data.get('total_categories', 0)} categories"
                    )
                    return True
                else:
                    self.log_test(
                        "Dashboard Stats", 
                        False, 
                        f"Missing required fields: {missing_fields}"
                    )
                    return False
            else:
                self.log_test(
                    "Dashboard Stats", 
                    False, 
                    f"Failed with status {response.status_code}",
                    {"response": response.text}
                )
                return False
                
        except Exception as e:
            self.log_test("Dashboard Stats", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 Starting Backend API Tests for {BACKEND_URL}")
        print("=" * 60)
        
        # Initialize admin first
        self.test_init_admin()
        
        # Test authentication
        if self.test_admin_login():
            # Test admin profile endpoints
            self.test_admin_profile_get()
            self.test_admin_profile_update()
            self.test_change_password()
            
            # Test unified stickers endpoints
            self.test_unified_stickers_get()
            self.test_unified_stickers_create()
            
            # Test Firebase configuration
            self.test_firebase_instructions()
            self.test_firebase_config_test()
            
            # Test system configuration
            self.test_system_config()
            
            # Test dashboard
            self.test_dashboard_stats()
        else:
            print("❌ Authentication failed - skipping authenticated tests")
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        # Show failed tests
        failed_tests = [result for result in self.test_results if not result["success"]]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['message']}")
        
        return passed == total

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)