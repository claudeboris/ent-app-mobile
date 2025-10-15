export const translations = {
  fr: {
    // Ajout des traductions pour l'écran des notifications
    notifications: {
      title: "Notifications",
      loading: "Chargement des notifications...",
      error: "Impossible de charger les notifications",
      emptyTitle: "Aucune notification",
      emptySubtitle: "Vous n'avez aucune notification non lue pour le moment.",
      refreshButton: "Actualiser",
      markAllAsRead: "Tout marquer comme lu",
      markAsRead: "Marquer comme lu",
      pay: "Payer",
      time: "Le {date} à {time}",
      notificationTypes: {
        systeme: "Système",
        paiement: "Paiement",
        examen: "Examen",
        resultat: "Résultat",
        absence: "Absence",
        message: "Message",
        default: "Notification"
      }
    },
    
    // Ajout des traductions pour l'écran de détail de notification
    notificationDetails: {
      title: "Détails de la notification",
      error: "Notification non trouvée",
      additionalInfo: "Informations complémentaires",
      meta: {
        type: "Type",
        priority: "Priorité",
        channels: "Canaux"
      }
    },
    
    welcome: {
      title: "Accédez au futur de l'éducation",
      button: "Commencer maintenant"
    },
    profile: {
      title: "Quel type de profil êtes-vous?",
      parent: "Je suis un parent d'étudiant",
      student: "Je suis un étudiant"
    },
    login: {
      title: "Connectez-vous à votre espace",
      subtitle: "Entrez vos coordonnées pour vous connecter",
      identifier: "Identifiant unique ou numéro de téléphone *",
      password: "Mot de passe *",
      remember: "Se souvenir de moi",
      forgot: "Mot de passe oublié?",
      submit: "Se connecter",
      loading: "Connexion...",
      parentIdentifier: "Numéro de téléphone *",
      studentIdentifier: "Numéro matricule *",
      parentPlaceholder: "+225 01 02 03 04 05",
      studentPlaceholder: "JB44405",
    },
    forgotPassword: {
      title: "Mot de passe oublié?",
      subtitle: "Entrez votre identifiant unique pour recevoir un code de vérification",
      identifier: "Identifiant unique *",
      submit: "Envoyer le code",
      back: "Retour à la connexion",
      parentIdentifier: "Numéro de téléphone *",
      studentIdentifier: "Numéro matricule *",
      parentPlaceholder: "+225 01 02 03 04 05",
      studentPlaceholder: "JB44405",
      parentInstructions: "Entrez votre numéro de téléphone associé à votre compte parent. Nous vous enverrons un code de vérification par SMS.",
      studentInstructions: "Entrez votre numéro matricule. Nous vous enverrons un code de vérification à votre adresse email.",
      error: "Veuillez entrer votre identifiant",
      // Ajout pour la modal
      modalTitle: "Mot de passe oublié",
      modalMessage: "Vous avez oublié votre mot de passe ? Veuillez contacter le service informatique pour obtenir de l'aide.",
      contactInfoTitle: "Service Informatique",
      contactPhone: "+221 33 123 45 67",
      contactEmail: "support@ecole.sn",
      contactHours: "Lun-Ven: 8h-17h",
      closeButton: "Fermer"
    },
    otp: {
      title: "Vérification OTP",
      parentDescription: "Nous avons envoyé un code à votre numéro de téléphone",
      studentDescription: "Nous avons envoyé un code à votre adresse email",
      submit: "Vérifier le code",
      resend: "Vous n'avez pas reçu le code?",
      resendLink: "Renvoyer"
    },
    resetPassword: {
      title: "Réinitialiser votre mot de passe",
      subtitle: "Changez votre mot de passe",
      password: "Votre nouveau mot de passe *",
      confirmPassword: "Confirmez le mot de passe *",
      requirementsTitle: "Mot de passe faible. Doit contenir au moins :",
      requirementsUppercase: "Au moins 1 majuscule",
      requirementsNumber: "Au moins 1 chiffre",
      requirementsLength: "Au moins 8 caractères",
      submit: "Confirmer",
      passwordMismatch: "Les mots de passe ne correspondent pas",
      invalidPassword: "Le mot de passe ne respecte pas les critères de sécurité"
    },
    footer: {
      copyright: "© 2024 ENT",
      language: "FR"
    },
    language: {
      title: "Choisissez votre langue",
      french: "Français",
      english: "Anglais",
      welcome: 'Bienvenue'
    },
    error: {
      title: "Erreur",
      fillAllFields: "Veuillez remplir tous les champs",
      loginFailed: "Identifiants incorrects",
      connectionError: "Une erreur est survenue lors de la connexion",
      invalidPhone: "Numéro de téléphone invalide",
      invalidStudentId: "Numéro matricule invalide"
    },
    // Ajout des traductions pour l'écran d'accueil
    home: {
      greeting: "Bonjour, ",
      loading: "Chargement des données...",
      quickActions: {
        establishment: "Infos Établissement",
        administration: "Administration"
      },
      attendance: {
        presence: "Heures de présence",
        absence: "Heures d'absence"
      },
      tabs: {
        homework: "Devoirs",
        exams: "Examens"
      },
      evaluation: {
        exam: "Examen",
        supervised: "Devoir surveillé",
        homework: "Devoir",
        today: "Aujourd'hui",
        tomorrow: "Demain",
        noHomework: "Aucun devoir à venir",
        noExams: "Aucun examen à venir"
      }
    },
    // Ajout des traductions pour l'écran de présence
    presence: {
      title: "Présence",
      loading: "Chargement des données...",
      error: "Impossible de charger les données de présence",
      schoolYear: "Année scolaire",
      period: "Période",
      presences: "Présences",
      absences: "Absences",
      attendanceRate: "Taux de présence",
      absencesList: "Liste des absences",
      justified: "Justifiée",
      unjustified: "Non justifiée",
      reason: "Motif",
      noAbsences: "Aucune absence enregistrée",
      firstQuarter: "1er trimestre",
      secondQuarter: "2ème trimestre",
      thirdQuarter: "3ème trimestre"
    },
    // Ajout des traductions pour l'écran d'emploi du temps
    schedule: {
      title: "Emploi du temps",
      loading: "Chargement de l'emploi du temps...",
      legend: "Légende:",
      classes: "Cours",
      homework: "Devoirs",
      exams: "Examens",
      today: "Aujourd'hui",
      tomorrow: "Demain",
      noEvents: "Aucun {type} pour le {day} {month}",
      months: {
        january: "Janvier",
        february: "Février",
        march: "Mars",
        april: "Avril",
        may: "Mai",
        june: "Juin",
        july: "Juillet",
        august: "Août",
        september: "Septembre",
        october: "Octobre",
        november: "Novembre",
        december: "Décembre"
      },
      daysOfWeek: {
        monday: "Lun",
        tuesday: "Mar",
        wednesday: "Mer",
        thursday: "Jeu",
        friday: "Ven",
        saturday: "Sam",
        sunday: "Dim"
      }
    },
    // Ajout des traductions pour l'écran des résultats
    results: {
      title: "Résultats",
      loading: "Chargement des données...",
      notesError: "Impossible de charger les données de notes",
      bulletinsError: "Impossible de charger les données de bulletins",
      schoolYear: "Année scolaire",
      period: "Période",
      average: "Moyenne",
      bestGrade: "Meilleure note",
      worstGrade: "Note la plus basse",
      subjects: "Matières",
      grade1: "Note 1",
      grade2: "Note 2",
      grade3: "Note 3",
      averageGrade: "Moyenne",
      teachers: "Professeurs",
      teacherOf: "Professeur de",
      reportCard: "Bulletin du",
      published: "PUBLIÉ",
      draft: "BROUILLON",
      classAverage: "Moyenne de classe",
      rank: "Rang",
      noReportCards: "Aucun bulletin disponible",
      noReportCardsForYear: "Aucun bulletin disponible pour cette année",
      firstQuarter: "1er trimestre",
      secondQuarter: "2ème trimestre",
      thirdQuarter: "3ème trimestre",
      gradeTable: "Tableau de notes",
      reportCards: "Bulletins"
    }
  },
  en: {
    welcome: {
      title: "Access the future of education",
      button: "Get started now"
    },
    profile: {
      title: "What type of profile are you?",
      parent: "I am a student's parent",
      student: "I am a student"
    },
    login: {
      title: "Sign in to your account",
      subtitle: "Enter your credentials to sign in",
      identifier: "Unique ID or phone number *",
      password: "Password *",
      remember: "Remember me",
      forgot: "Forgot password?",
      submit: "Sign in",
      loading: "Signing in...",
      parentIdentifier: "Phone number *",
      studentIdentifier: "Student ID *",
      parentPlaceholder: "+225 01 02 03 04 05",
      studentPlaceholder: "JB44405",
    },
    forgotPassword: {
      title: "Forgot password?",
      subtitle: "Enter your unique ID to receive a verification code",
      identifier: "Unique ID *",
      submit: "Send code",
      back: "Back to login",
      parentIdentifier: "Phone number *",
      studentIdentifier: "Student ID *",
      parentPlaceholder: "+225 01 02 03 04 05",
      studentPlaceholder: "JB44405",
      parentInstructions: "Enter your phone number associated with your parent account. We will send a verification code via SMS.",
      studentInstructions: "Enter your student ID. We will send a verification code to your email address.",
      error: "Please enter your identifier",
      // Ajout pour la modal
      modalTitle: "Forgot Password",
      modalMessage: "Have you forgotten your password? Please contact the IT service for assistance.",
      contactInfoTitle: "IT Service",
      contactPhone: "+221 33 123 45 67",
      contactEmail: "support@ecole.sn",
      contactHours: "Mon-Fri: 8am-5pm",
      closeButton: "Close"
    },
    otp: {
      title: "OTP Verification",
      parentDescription: "We have sent a code to your phone number",
      studentDescription: "We have sent a code to your email address",
      submit: "Verify code",
      resend: "Didn't receive the code?",
      resendLink: "Resend"
    },
    resetPassword: {
      title: "Reset your password",
      subtitle: "Change your password",
      password: "Your new password *",
      confirmPassword: "Confirm password *",
      requirementsTitle: "Weak password. Must contain at least:",
      requirementsUppercase: "At least 1 uppercase letter",
      requirementsNumber: "At least 1 number",
      requirementsLength: "At least 8 characters",
      submit: "Confirm",
      passwordMismatch: "Passwords do not match",
      invalidPassword: "Password does not meet security requirements"
    },
    footer: {
      copyright: "© 2024 ENT",
      language: "EN"
    },
    language: {
      title: "Choose your language",
      french: "French",
      english: "English",
      welcome: 'Welcome'
    },
    error: {
      title: "Error",
      fillAllFields: "Please fill in all fields",
      loginFailed: "Incorrect credentials",
      connectionError: "An error occurred during login",
      invalidPhone: "Invalid phone number",
      invalidStudentId: "Invalid student ID"
    },
    // Ajout des traductions pour l'écran d'accueil
    home: {
      greeting: "Hello, ",
      loading: "Loading data...",
      quickActions: {
        establishment: "Establishment Info",
        administration: "Administration"
      },
      attendance: {
        presence: "Attendance Hours",
        absence: "Absence Hours"
      },
      tabs: {
        homework: "Homework",
        exams: "Exams"
      },
      evaluation: {
        exam: "Exam",
        supervised: "Supervised Assignment",
        homework: "Assignment",
        today: "Today",
        tomorrow: "Tomorrow",
        noHomework: "No upcoming homework",
        noExams: "No upcoming exams"
      }
    },
    // Ajout des traductions pour l'écran de présence
    presence: {
      title: "Attendance",
      loading: "Loading data...",
      error: "Unable to load attendance data",
      schoolYear: "School Year",
      period: "Period",
      presences: "Presences",
      absences: "Absences",
      attendanceRate: "Attendance Rate",
      absencesList: "Absences List",
      justified: "Justified",
      unjustified: "Unjustified",
      reason: "Reason",
      noAbsences: "No absences recorded",
      firstQuarter: "1st quarter",
      secondQuarter: "2nd quarter",
      thirdQuarter: "3rd quarter"
    },
    // Ajout des traductions pour l'écran d'emploi du temps
    schedule: {
      title: "Schedule",
      loading: "Loading schedule...",
      legend: "Legend:",
      classes: "Classes",
      homework: "Homework",
      exams: "Exams",
      today: "Today",
      tomorrow: "Tomorrow",
      noEvents: "No {type} on {day} {month}",
      months: {
        january: "January",
        february: "February",
        march: "March",
        april: "April",
        may: "May",
        june: "June",
        july: "July",
        august: "August",
        september: "September",
        october: "October",
        november: "November",
        december: "December"
      },
      daysOfWeek: {
        monday: "Mon",
        tuesday: "Tue",
        wednesday: "Wed",
        thursday: "Thu",
        friday: "Fri",
        saturday: "Sat",
        sunday: "Sun"
      }
    },
    // Ajout des traductions pour l'écran des résultats
    results: {
      title: "Results",
      loading: "Loading data...",
      notesError: "Unable to load grades data",
      bulletinsError: "Unable to load report cards data",
      schoolYear: "School Year",
      period: "Period",
      average: "Average",
      bestGrade: "Best Grade",
      worstGrade: "Lowest Grade",
      subjects: "Subjects",
      grade1: "Grade 1",
      grade2: "Grade 2",
      grade3: "Grade 3",
      averageGrade: "Average",
      teachers: "Teachers",
      teacherOf: "Teacher of",
      reportCard: "Report Card of",
      published: "PUBLISHED",
      draft: "DRAFT",
      classAverage: "Class Average",
      rank: "Rank",
      noReportCards: "No report cards available",
      noReportCardsForYear: "No report cards available for this year",
      firstQuarter: "1st quarter",
      secondQuarter: "2nd quarter",
      thirdQuarter: "3rd quarter",
      gradeTable: "Grade Table",
      reportCards: "Report Cards"
    },

    notifications: {
      title: "Notifications",
      loading: "Loading notifications...",
      error: "Unable to load notifications",
      emptyTitle: "No notifications",
      emptySubtitle: "You don't have any unread notifications at the moment.",
      refreshButton: "Refresh",
      markAllAsRead: "Mark all as read",
      markAsRead: "Mark as read",
      pay: "Pay",
      time: "On {date} at {time}",
      notificationTypes: {
        systeme: "System",
        paiement: "Payment",
        examen: "Exam",
        resultat: "Result",
        absence: "Absence",
        message: "Message",
        default: "Notification"
      }
    },
    
    // Ajout des traductions pour l'écran de détail de notification
    notificationDetails: {
      title: "Notification Details",
      error: "Notification not found",
      additionalInfo: "Additional Information",
      meta: {
        type: "Type",
        priority: "Priority",
        channels: "Channels"
      }
    },
    
  }
};