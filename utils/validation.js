// Utilitaires de validation pour les formulaires

export class Validator {
  
  // Valider un email
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || !email.trim()) {
      return { isValid: false, message: 'L\'email est requis' };
    }
    
    if (!emailRegex.test(email.trim())) {
      return { isValid: false, message: 'Format d\'email invalide' };
    }
    
    return { isValid: true };
  }

  // Valider un numéro de téléphone
  static validatePhone(phone) {
    // Regex pour numéros ivoiriens et internationaux
    const phoneRegex = /^[\+]?[0-9\-\s\(\)]{8,15}$/;
    const ivoirianRegex = /^(0[1-9]|[+]225)[0-9\s\-]{7,}$/;
    
    if (!phone || !phone.trim()) {
      return { isValid: false, message: 'Le numéro de téléphone est requis' };
    }
    
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    if (!phoneRegex.test(phone)) {
      return { isValid: false, message: 'Format de téléphone invalide' };
    }
    
    if (cleanPhone.length < 8) {
      return { isValid: false, message: 'Numéro de téléphone trop court' };
    }
    
    return { isValid: true };
  }

  // Valider un mot de passe
  static validatePassword(password, options = {}) {
    const {
      minLength = 6,
      requireUppercase = false,
      requireLowercase = false,
      requireNumbers = false,
      requireSpecialChars = false
    } = options;

    if (!password) {
      return { isValid: false, message: 'Le mot de passe est requis' };
    }

    if (password.length < minLength) {
      return { 
        isValid: false, 
        message: `Le mot de passe doit contenir au moins ${minLength} caractères` 
      };
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
      return { 
        isValid: false, 
        message: 'Le mot de passe doit contenir au moins une majuscule' 
      };
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
      return { 
        isValid: false, 
        message: 'Le mot de passe doit contenir au moins une minuscule' 
      };
    }

    if (requireNumbers && !/\d/.test(password)) {
      return { 
        isValid: false, 
        message: 'Le mot de passe doit contenir au moins un chiffre' 
      };
    }

    if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { 
        isValid: false, 
        message: 'Le mot de passe doit contenir au moins un caractère spécial' 
      };
    }

    return { isValid: true };
  }

  // Valider une confirmation de mot de passe
  static validatePasswordConfirmation(password, confirmPassword) {
    if (!confirmPassword) {
      return { isValid: false, message: 'La confirmation du mot de passe est requise' };
    }

    if (password !== confirmPassword) {
      return { isValid: false, message: 'Les mots de passe ne correspondent pas' };
    }

    return { isValid: true };
  }

  // Valider un nom (nom/prénom)
  static validateName(name, fieldName = 'nom') {
    if (!name || !name.trim()) {
      return { isValid: false, message: `Le ${fieldName} est requis` };
    }

    if (name.trim().length < 2) {
      return { 
        isValid: false, 
        message: `Le ${fieldName} doit contenir au moins 2 caractères` 
      };
    }

    // Vérifier les caractères autorisés (lettres, espaces, tirets, apostrophes)
    const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
    if (!nameRegex.test(name.trim())) {
      return { 
        isValid: false, 
        message: `Le ${fieldName} ne peut contenir que des lettres, espaces, tirets et apostrophes` 
      };
    }

    return { isValid: true };
  }

  // Valider un identifiant étudiant
  static validateStudentId(studentId) {
    if (!studentId || !studentId.trim()) {
      return { isValid: false, message: 'L\'identifiant étudiant est requis' };
    }

    // Format: lettres et/ou chiffres, minimum 3 caractères
    const studentIdRegex = /^[a-zA-Z0-9]{3,20}$/;
    if (!studentIdRegex.test(studentId.trim())) {
      return { 
        isValid: false, 
        message: 'L\'identifiant doit contenir entre 3 et 20 caractères alphanumériques' 
      };
    }

    return { isValid: true };
  }

  // Valider une date de naissance
  static validateBirthDate(dateString) {
    if (!dateString) {
      return { isValid: false, message: 'La date de naissance est requise' };
    }

    const date = new Date(dateString);
    const today = new Date();
    
    if (isNaN(date.getTime())) {
      return { isValid: false, message: 'Format de date invalide' };
    }

    if (date >= today) {
      return { isValid: false, message: 'La date de naissance doit être antérieure à aujourd\'hui' };
    }

    // Vérifier un âge raisonnable (entre 3 et 100 ans)
    const age = today.getFullYear() - date.getFullYear();
    if (age < 3 || age > 100) {
      return { isValid: false, message: 'Âge non valide' };
    }

    return { isValid: true };
  }

  // Valider une adresse
  static validateAddress(address) {
    if (!address || !address.trim()) {
      return { isValid: false, message: 'L\'adresse est requise' };
    }

    if (address.trim().length < 10) {
      return { 
        isValid: false, 
        message: 'L\'adresse doit contenir au moins 10 caractères' 
      };
    }

    return { isValid: true };
  }

  // Valider un formulaire complet
  static validateLoginForm(data, userType) {
    const errors = {};

    // Valider l'identifiant selon le type d'utilisateur
    if (userType === 'parent') {
      const phoneValidation = this.validatePhone(data.identifier);
      if (!phoneValidation.isValid) {
        errors.identifier = phoneValidation.message;
      }
    } else {
      const studentIdValidation = this.validateStudentId(data.identifier);
      if (!studentIdValidation.isValid) {
        errors.identifier = studentIdValidation.message;
      }
    }

    // Valider le mot de passe
    const passwordValidation = this.validatePassword(data.password, { minLength: 4 });
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Valider un formulaire de profil
  static validateProfileForm(data) {
    const errors = {};

    // Valider le nom complet
    if (data.name) {
      const nameValidation = this.validateName(data.name, 'nom complet');
      if (!nameValidation.isValid) {
        errors.name = nameValidation.message;
      }
    }

    // Valider l'email
    if (data.email) {
      const emailValidation = this.validateEmail(data.email);
      if (!emailValidation.isValid) {
        errors.email = emailValidation.message;
      }
    }

    // Valider le téléphone
    if (data.phone) {
      const phoneValidation = this.validatePhone(data.phone);
      if (!phoneValidation.isValid) {
        errors.phone = phoneValidation.message;
      }
    }

    // Valider l'adresse (optionnelle)
    if (data.address && data.address !== 'Ajouter un lieu') {
      const addressValidation = this.validateAddress(data.address);
      if (!addressValidation.isValid) {
        errors.address = addressValidation.message;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Valider un formulaire de changement de mot de passe
  static validatePasswordChangeForm(data) {
    const errors = {};

    // Valider l'ancien mot de passe
    if (!data.currentPassword) {
      errors.currentPassword = 'L\'ancien mot de passe est requis';
    }

    // Valider le nouveau mot de passe
    const newPasswordValidation = this.validatePassword(data.newPassword, {
      minLength: 6,
      requireNumbers: true
    });
    if (!newPasswordValidation.isValid) {
      errors.newPassword = newPasswordValidation.message;
    }

    // Valider la confirmation du nouveau mot de passe
    const confirmationValidation = this.validatePasswordConfirmation(
      data.newPassword, 
      data.confirmPassword
    );
    if (!confirmationValidation.isValid) {
      errors.confirmPassword = confirmationValidation.message;
    }

    // Vérifier que le nouveau mot de passe est différent de l'ancien
    if (data.currentPassword && data.newPassword && data.currentPassword === data.newPassword) {
      errors.newPassword = 'Le nouveau mot de passe doit être différent de l\'ancien';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Nettoyer et formater un numéro de téléphone
  static formatPhoneNumber(phone) {
    if (!phone) return '';
    
    // Supprimer tous les caractères non numériques sauf le +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Si le numéro commence par 0, on suppose que c'est un numéro local ivoirien
    if (cleaned.startsWith('0') && cleaned.length >= 10) {
      cleaned = '+225' + cleaned.substring(1);
    }
    
    return cleaned;
  }

  // Nettoyer et formater un nom
  static formatName(name) {
    if (!name) return '';
    
    return name
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Vérifier la force d'un mot de passe
  static getPasswordStrength(password) {
    if (!password) return { score: 0, text: 'Très faible', color: '#ff4444' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    score = Object.values(checks).filter(Boolean).length;
    
    const strengthLevels = [
      { score: 0, text: 'Très faible', color: '#ff4444' },
      { score: 1, text: 'Faible', color: '#ff8800' },
      { score: 2, text: 'Moyen', color: '#ffaa00' },
      { score: 3, text: 'Fort', color: '#88cc00' },
      { score: 4, text: 'Très fort', color: '#44aa00' },
      { score: 5, text: 'Excellent', color: '#00aa44' }
    ];
    
    return strengthLevels[score] || strengthLevels[0];
  }
}

// Export par défaut
export default Validator;