import { type Locale } from "@/lib/types";

export type AppDictionary = {
  appName: string;
  nav: {
    dashboard: string;
    workspace: string;
    login: string;
    register: string;
    logout: string;
    tagline: string;
  };
  landing: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    heroHighlights: readonly {
      title: string;
      description: string;
    }[];
    studioTitle: string;
    studioChatTitle: string;
    studioChatDescription: string;
    studioProcessingTitle: string;
    studioProcessingDescription: string;
    workspaceTitle: string;
    workspaceDescription: string;
    howItWorksTitle: string;
    howItWorksDescription: string;
    howItWorksSteps: readonly {
      title: string;
      description: string;
    }[];
    useCasesTitle: string;
    useCasesDescription: string;
    useCases: readonly {
      title: string;
      description: string;
    }[];
    proofTitle: string;
    proofDescription: string;
    proofPoints: readonly {
      title: string;
      description: string;
    }[];
    trustLabels: readonly string[];
  };
  auth: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    name: string;
    signIn: string;
    signUp: string;
    signInGoogle: string;
    toggleToSignUp: string;
    toggleToSignIn: string;
    demoHint: string;
    modeFirebase: string;
    modeDemo: string;
    statusLive: string;
    statusDemo: string;
  };
  dashboard: {
    eyebrow: string;
    title: string;
    description: string;
    welcomeTitle: string;
    welcomeDescription: string;
    createModeTitle: string;
    editModeTitle: string;
    createHint: string;
    editHint: string;
    name: string;
    descriptionField: string;
    subject: string;
    accentColor: string;
    projectIcon: string;
    colorPalette: string;
    createCta: string;
    createSuccess: string;
    saveChanges: string;
    cancelEdit: string;
    searchPlaceholder: string;
    sortLabel: string;
    sortUpdated: string;
    sortName: string;
    sortSubject: string;
    allFilter: string;
    favoriteFilter: string;
    activeProjects: string;
    favoritesCounter: string;
    archivedCounter: string;
    favoritesSection: string;
    recentSection: string;
    allSection: string;
    archivedSection: string;
    archivedToggle: string;
    archivedClose: string;
    openProject: string;
    editProject: string;
    favorite: string;
    unfavorite: string;
    archive: string;
    restore: string;
    delete: string;
    deleteConfirm: string;
    noSubject: string;
    lastActivity: string;
    documentsTotal: string;
    documentsReady: string;
    documentsProcessing: string;
    noDescription: string;
    loadingProjects: string;
    emptyTitle: string;
    emptyDescription: string;
    emptyFirstTitle: string;
    emptyFirstDescription: string;
    emptyFirstCta: string;
    clearFilters: string;
    emptyArchived: string;
  };
  workspace: {
    back: string;
    documents: string;
    preview: string;
    chat: string;
    upload: string;
    filterAll: string;
    askPlaceholder: string;
    send: string;
    processing: string;
    ready: string;
    queued: string;
    error: string;
    noDocuments: string;
    noPreview: string;
    noMessages: string;
    scopeLabel: string;
    citations: string;
    mobileDocs: string;
    mobilePreview: string;
    mobileChat: string;
    processingHint: string;
    unsupportedPreview: string;
    switchProject: string;
    favorites: string;
    recent: string;
    noProjects: string;
    editProject: string;
    documentsSearch: string;
    includedInChat: string;
    addToChatScope: string;
    selectedDocs: string;
    loadingPreview: string;
    noSubject: string;
    createModeTitle: string;
    editModeTitle: string;
    createHint: string;
    editHint: string;
    name: string;
    descriptionField: string;
    subject: string;
    accentColor: string;
    projectIcon: string;
    colorPalette: string;
    createCta: string;
    saveChanges: string;
    cancelEdit: string;
    projectFallbackTitle: string;
    roleUser: string;
    roleAssistant: string;
  };
  common: {
    loading: string;
    search: string;
    language: string;
    demo: string;
    firebase: string;
    online: string;
    offline: string;
    notFoundTitle: string;
    notFoundDescription: string;
  };
  errors: {
    authenticationFailed: string;
    unableToSyncSession: string;
    unableToLoadProjects: string;
    unableToSaveProject: string;
    unableToUpdateProject: string;
    unableToDeleteProject: string;
    unableToLoadProject: string;
    unableToLoadMessages: string;
    unableToRefreshProject: string;
    unableToLoadPreview: string;
    unableToUploadDocuments: string;
    unableToSendMessage: string;
    projectNotFound: string;
    documentNotFound: string;
    archiveBeforeDelete: string;
    unsupportedFileType: string;
    missingFiles: string;
    unableToCreateSession: string;
    missingAuthorization: string;
    unableToLoadAsset: string;
    unableToGenerateAnswer: string;
  };
};

export type DictionarySection<K extends keyof AppDictionary> = AppDictionary[K];

const dictionaries: Record<Locale, AppDictionary> = {
  es: {
    appName: "StudyTodAI",
    nav: {
      dashboard: "Proyectos",
      workspace: "Espacio",
      login: "Acceder",
      register: "Registrarse",
      logout: "Salir",
      tagline: "Espacio de estudio con IA",
    },
    landing: {
      eyebrow: "Espacio académico con IA",
      title: "Convierte tus apuntes en un proyecto vivo de estudio.",
      description:
        "Para estudiantes universitarios que no quieren perderse nada en el examen. Sube PDFs, presentaciones e imágenes y estudia con contexto, citas y una vista clara del material.",
      primaryCta: "Entrar al dashboard",
      secondaryCta: "Cómo funciona",
      heroHighlights: [
        {
          title: "Chat con citas reales",
          description: "Cada respuesta puede volver al documento, página o diapositiva exacta.",
        },
        {
          title: "Vista previa central",
          description: "Lees, señalas y repasas sin perder el hilo entre documentos y conversación.",
        },
        {
          title: "Procesado en segundo plano",
          description: "OCR, conversiones y preparación del contenido sin bloquear tu sesión de estudio.",
        },
      ],
      studioTitle: "Vista del estudio",
      studioChatTitle: "Chat sobre documentos",
      studioChatDescription:
        "Pregunta por un tema de examen, una diapositiva o una demostración. El asistente mantiene las citas vinculadas y el contexto del proyecto.",
      studioProcessingTitle: "Carril de procesado",
      studioProcessingDescription:
        "Los trabajos asíncronos mantienen la conversión de Office, el OCR y la indexación fuera de la ruta crítica.",
      workspaceTitle: "Espacio de estudio de tres paneles",
      workspaceDescription:
        "Documentos a la izquierda, vista previa en el centro e IA a la derecha. En móvil se compacta en pestañas enfocadas.",
      howItWorksTitle: "Cómo funciona",
      howItWorksDescription:
        "La landing ya no se queda en una promesa general: enseña exactamente cómo entras, organizas material y repasas con ayuda de la IA.",
      howItWorksSteps: [
        {
          title: "1. Reúne el material del examen",
          description: "Crea un proyecto por asignatura o parcial y sube PDFs, PPTX, DOCX o imágenes de clase.",
        },
        {
          title: "2. Mantén el contexto visible",
          description: "Selecciona un documento, abre la vista previa y acota el chat a lo que realmente quieres estudiar.",
        },
        {
          title: "3. Repasa con trazabilidad",
          description: "Pide resúmenes, conceptos o ejercicios y salta a la fuente cuando necesites comprobar algo.",
        },
      ],
      useCasesTitle: "Casos de uso",
      useCasesDescription:
        "StudyTodAI no intenta ser una app genérica. Encaja mejor cuando necesitas estudiar rápido, con material disperso y poco margen para perder tiempo.",
      useCases: [
        {
          title: "Repaso antes del parcial",
          description: "Cruza apuntes, diapositivas y prácticas para detectar qué entra y qué lagunas te quedan.",
        },
        {
          title: "Preparación oral o exposición",
          description: "Encuentra ejemplos, definiciones y fragmentos clave sin navegar manualmente por cada archivo.",
        },
        {
          title: "Semana de entregas",
          description: "Centraliza el material de una asignatura y cambia entre documentos, preview y chat desde móvil o desktop.",
        },
      ],
      proofTitle: "Lo que verás al entrar",
      proofDescription:
        "En vez de dejar huecos vacíos, la home refleja la estructura real del producto y sus señales de confianza.",
      proofPoints: [
        {
          title: "Jerarquía clara",
          description: "Un hero con contexto visual inmediato, CTAs diferenciados y bloques que guían el recorrido.",
        },
        {
          title: "Texto más legible",
          description: "Más contraste, mayor cuerpo en descripciones y un tracking menos agresivo en etiquetas.",
        },
        {
          title: "Responsive de verdad",
          description: "La idea de los tres paneles también se entiende en móvil mediante tabs y mockups compactos.",
        },
      ],
      trustLabels: ["PDF", "PPTX", "DOCX", "OCR", "Citas", "Preview", "Móvil"],
    },
    auth: {
      title: "Tu asistente académico te espera",
      subtitle:
        "Entra con Google o crea una cuenta para guardar proyectos, documentos y conversaciones.",
      email: "Correo",
      password: "Contraseña",
      name: "Nombre",
      signIn: "Entrar",
      signUp: "Crear cuenta",
      signInGoogle: "Continuar con Google",
      toggleToSignUp: "No tengo cuenta",
      toggleToSignIn: "Ya tengo cuenta",
      demoHint:
        "Si no configuras Firebase, la app entra en modo demo persistente local.",
      modeFirebase: "Auth Firebase",
      modeDemo: "Demo local",
      statusLive: "ACTIVO",
      statusDemo: "DEMO",
    },
    dashboard: {
      eyebrow: "Tus espacios de estudio",
      title: "Gestiona proyectos, prioridades y contexto desde un solo hub.",
      description:
        "Organiza por asignatura o examen, fija lo importante, archiva lo cerrado y entra al workspace correcto sin perder tiempo.",
      welcomeTitle: "Tu hub de estudio está listo para arrancar",
      welcomeDescription:
        "Cuando crees tu primer proyecto, aquí verás actividad, favoritos y accesos rápidos sin ruido innecesario.",
      createModeTitle: "Nuevo proyecto",
      editModeTitle: "Editar proyecto",
      createHint: "Crea un espacio nuevo, define su estilo y aparecerá al instante en recientes.",
      editHint: "Actualiza el nombre, la asignatura, la descripción o el estilo visual del proyecto actual.",
      name: "Nombre del proyecto",
      descriptionField: "Descripción",
      subject: "Asignatura",
      accentColor: "Estilo visual",
      projectIcon: "Símbolo",
      colorPalette: "Paleta",
      createCta: "Crear proyecto",
      createSuccess: "Proyecto creado correctamente.",
      saveChanges: "Guardar cambios",
      cancelEdit: "Cancelar",
      searchPlaceholder: "Buscar por nombre, materia o descripción",
      sortLabel: "Ordenar",
      sortUpdated: "Actividad reciente",
      sortName: "Nombre",
      sortSubject: "Asignatura",
      allFilter: "Todos",
      favoriteFilter: "Solo favoritos",
      activeProjects: "Activos",
      favoritesCounter: "Favoritos",
      archivedCounter: "Archivados",
      favoritesSection: "Favoritos",
      recentSection: "Recientes",
      allSection: "Todos los proyectos",
      archivedSection: "Archivados",
      archivedToggle: "Ver archivados",
      archivedClose: "Cerrar archivados",
      openProject: "Abrir proyecto",
      editProject: "Editar",
      favorite: "Fijar",
      unfavorite: "Quitar favorito",
      archive: "Archivar",
      restore: "Restaurar",
      delete: "Borrar",
      deleteConfirm: "Este proyecto se borrará definitivamente. Esta acción no se puede deshacer.",
      noSubject: "Sin asignatura",
      lastActivity: "Última actividad",
      documentsTotal: "Docs",
      documentsReady: "Listos",
      documentsProcessing: "Procesando",
      noDescription: "Añade una breve descripción para diferenciar mejor este proyecto.",
      loadingProjects: "Cargando proyectos...",
      emptyTitle: "No aparece ningún proyecto con este filtro",
      emptyDescription: "Prueba con otra búsqueda o vuelve a la vista completa para recuperar tu hub.",
      emptyFirstTitle: "Convierte esta pantalla en tu centro de estudio",
      emptyFirstDescription:
        "Crea un primer proyecto para reunir apuntes, prácticas y exámenes en el mismo espacio.",
      emptyFirstCta: "Crea tu primer proyecto",
      clearFilters: "Mostrar todos",
      emptyArchived: "No hay proyectos archivados ahora mismo.",
    },
    workspace: {
      back: "Volver",
      documents: "Tus documentos",
      preview: "Previsualización",
      chat: "Chat IA",
      upload: "Subir documentos",
      filterAll: "Todo el proyecto",
      askPlaceholder: "Pregunta sobre tus documentos, una diapositiva o un concepto...",
      send: "Enviar",
      processing: "Procesando",
      ready: "Listo",
      queued: "En cola",
      error: "Error",
      noDocuments: "Aún no has subido documentos a este proyecto.",
      noPreview: "Selecciona un documento para ver su preview.",
      noMessages: "Empieza preguntando algo sobre el contenido del proyecto.",
      scopeLabel: "Contexto del chat",
      citations: "Fuentes",
      mobileDocs: "Docs",
      mobilePreview: "Preview",
      mobileChat: "Chat",
      processingHint:
        "Los archivos Office e imágenes se procesan en segundo plano y aparecerán aquí en cuanto estén listos.",
      unsupportedPreview: "El preview aparecerá cuando la conversión del archivo esté lista.",
      switchProject: "Cambiar proyecto",
      favorites: "Favoritos",
      recent: "Recientes",
      noProjects: "No hay más proyectos activos.",
      editProject: "Editar proyecto",
      documentsSearch: "Buscar",
      includedInChat: "Incluido en chat",
      addToChatScope: "Añadir al contexto",
      selectedDocs: "docs seleccionados",
      loadingPreview: "Cargando preview...",
      noSubject: "Sin asignatura",
      createModeTitle: "Nuevo proyecto",
      editModeTitle: "Editar proyecto",
      createHint: "Crea un espacio nuevo, define su estilo y aparecerá al instante en recientes.",
      editHint: "Ajusta el nombre, la asignatura, la descripción o el estilo visual sin salir del workspace.",
      name: "Nombre del proyecto",
      descriptionField: "Descripción",
      subject: "Asignatura",
      accentColor: "Estilo visual",
      projectIcon: "Símbolo",
      colorPalette: "Paleta",
      createCta: "Crear proyecto",
      saveChanges: "Guardar cambios",
      cancelEdit: "Cancelar",
      projectFallbackTitle: "Proyecto",
      roleUser: "Usuario",
      roleAssistant: "Asistente",
    },
    common: {
      loading: "Cargando...",
      search: "Buscar",
      language: "Idioma",
      demo: "Demo",
      firebase: "Firebase",
      online: "En línea",
      offline: "Sin configurar",
      notFoundTitle: "Página no encontrada",
      notFoundDescription:
        "La ruta solicitada no existe o el segmento de idioma no es válido.",
    },
    errors: {
      authenticationFailed: "No se pudo completar la autenticación.",
      unableToSyncSession: "No se pudo sincronizar la sesión.",
      unableToLoadProjects: "No se pudieron cargar los proyectos.",
      unableToSaveProject: "No se pudo guardar el proyecto.",
      unableToUpdateProject: "No se pudo actualizar el proyecto.",
      unableToDeleteProject: "No se pudo borrar el proyecto.",
      unableToLoadProject: "No se pudo cargar el proyecto.",
      unableToLoadMessages: "No se pudieron cargar los mensajes.",
      unableToRefreshProject: "No se pudo refrescar el proyecto.",
      unableToLoadPreview: "No se pudo cargar la vista previa.",
      unableToUploadDocuments: "No se pudieron subir los documentos.",
      unableToSendMessage: "No se pudo enviar el mensaje.",
      projectNotFound: "Proyecto no encontrado.",
      documentNotFound: "Documento no encontrado.",
      archiveBeforeDelete: "Archiva el proyecto antes de borrarlo definitivamente.",
      unsupportedFileType: "Tipo de archivo no compatible.",
      missingFiles: "Faltan archivos por subir.",
      unableToCreateSession: "No se pudo crear la sesión.",
      missingAuthorization: "Falta autorización.",
      unableToLoadAsset: "No se pudo cargar el recurso.",
      unableToGenerateAnswer: "No se pudo generar la respuesta.",
    },
  },
  en: {
    appName: "StudyTodAI",
    nav: {
      dashboard: "Projects",
      workspace: "Workspace",
      login: "Sign in",
      register: "Register",
      logout: "Sign out",
      tagline: "AI study workspace",
    },
    landing: {
      eyebrow: "AI academic workspace",
      title: "Turn class material into a living study project.",
      description:
        "For university students who do not want to miss anything on the exam. Upload PDFs, slides, and images, then study with citations, structure, and a clear view of the material.",
      primaryCta: "Open dashboard",
      secondaryCta: "See how it works",
      heroHighlights: [
        {
          title: "Chat with real citations",
          description: "Every answer can point back to the exact document, page, or slide.",
        },
        {
          title: "Central preview pane",
          description: "Read, inspect, and review without losing the thread between source material and chat.",
        },
        {
          title: "Background processing",
          description: "OCR, conversions, and indexing happen off the critical path of the study session.",
        },
      ],
      studioTitle: "Studio view",
      studioChatTitle: "Chat over docs",
      studioChatDescription:
        "Ask about an exam topic, a slide, or a proof. The assistant keeps citations attached and project context in view.",
      studioProcessingTitle: "Processing lane",
      studioProcessingDescription:
        "Async jobs keep Office conversion, OCR, and indexing off the critical UX path.",
      workspaceTitle: "Three-pane workspace",
      workspaceDescription:
        "Docs on the left, preview in the middle, AI on the right. Mobile collapses into focused tabs.",
      howItWorksTitle: "How it works",
      howItWorksDescription:
        "The landing no longer stops at a broad promise. It shows how you enter, organize material, and review with AI support.",
      howItWorksSteps: [
        {
          title: "1. Collect exam material",
          description: "Create one project per subject or test and upload PDFs, PPTX, DOCX, or class images.",
        },
        {
          title: "2. Keep context visible",
          description: "Select a document, open the preview, and scope the chat to the exact material you want to study.",
        },
        {
          title: "3. Review with traceability",
          description: "Ask for summaries, concepts, or exercises and jump back to the source whenever you need to verify.",
        },
      ],
      useCasesTitle: "Use cases",
      useCasesDescription:
        "StudyTodAI is not trying to be a generic notes app. It fits best when time is short and your material is scattered.",
      useCases: [
        {
          title: "Pre-exam review",
          description: "Cross notes, slides, and practice sets to see what is likely to matter and what you still miss.",
        },
        {
          title: "Oral prep or presentation",
          description: "Find examples, definitions, and key passages without manually opening every file.",
        },
        {
          title: "Assignment-heavy weeks",
          description: "Centralize one subject, then switch between docs, preview, and chat from desktop or mobile.",
        },
      ],
      proofTitle: "What you see before you trust it",
      proofDescription:
        "Instead of leaving dead space, the home reflects the real product structure and clearer trust signals.",
      proofPoints: [
        {
          title: "Clear hierarchy",
          description: "A hero with immediate product context, distinct CTAs, and sections that guide the scroll.",
        },
        {
          title: "More readable copy",
          description: "Higher contrast, larger supporting text, and less aggressive tracking in labels.",
        },
        {
          title: "Responsive by design",
          description: "The three-pane workspace is also explained on mobile through focused tabs and compact mockups.",
        },
      ],
      trustLabels: ["PDF", "PPTX", "DOCX", "OCR", "Citations", "Preview", "Mobile"],
    },
    auth: {
      title: "Your academic copilot is ready",
      subtitle:
        "Sign in with Google or create an account to save projects, documents, and conversations.",
      email: "Email",
      password: "Password",
      name: "Name",
      signIn: "Sign in",
      signUp: "Create account",
      signInGoogle: "Continue with Google",
      toggleToSignUp: "I need an account",
      toggleToSignIn: "I already have one",
      demoHint:
        "Without Firebase config, the app falls back to a persistent local demo mode.",
      modeFirebase: "Firebase Auth",
      modeDemo: "Local Demo",
      statusLive: "LIVE",
      statusDemo: "DEMO",
    },
    dashboard: {
      eyebrow: "Your study spaces",
      title: "Manage projects, priorities, and context from one hub.",
      description:
        "Organize by subject or exam, pin what matters, archive what is done, and jump into the right workspace faster.",
      welcomeTitle: "Your study hub is ready to start",
      welcomeDescription:
        "Once you create your first project, this area will show activity, favorites, and quick access without the extra noise.",
      createModeTitle: "New project",
      editModeTitle: "Edit project",
      createHint: "Create a new study space, set its look, and it will appear in recents immediately.",
      editHint: "Update the name, subject, description, or visual style of the current project.",
      name: "Project name",
      descriptionField: "Description",
      subject: "Subject",
      accentColor: "Visual style",
      projectIcon: "Symbol",
      colorPalette: "Palette",
      createCta: "Create project",
      createSuccess: "Project created successfully.",
      saveChanges: "Save changes",
      cancelEdit: "Cancel",
      searchPlaceholder: "Search by name, subject, or description",
      sortLabel: "Sort",
      sortUpdated: "Recent activity",
      sortName: "Name",
      sortSubject: "Subject",
      allFilter: "All",
      favoriteFilter: "Favorites only",
      activeProjects: "Active",
      favoritesCounter: "Favorites",
      archivedCounter: "Archived",
      favoritesSection: "Favorites",
      recentSection: "Recent",
      allSection: "All projects",
      archivedSection: "Archived",
      archivedToggle: "View archived",
      archivedClose: "Close archived",
      openProject: "Open project",
      editProject: "Edit",
      favorite: "Pin",
      unfavorite: "Unpin",
      archive: "Archive",
      restore: "Restore",
      delete: "Delete",
      deleteConfirm: "This project will be permanently deleted. This action cannot be undone.",
      noSubject: "No subject",
      lastActivity: "Last activity",
      documentsTotal: "Docs",
      documentsReady: "Ready",
      documentsProcessing: "Processing",
      noDescription: "Add a short description to make this project easier to scan.",
      loadingProjects: "Loading projects...",
      emptyTitle: "No projects match this view right now",
      emptyDescription: "Try a different search or switch back to the full view to recover your hub.",
      emptyFirstTitle: "Turn this screen into your study command center",
      emptyFirstDescription:
        "Create your first project to keep notes, practice sets, and exam prep in the same space.",
      emptyFirstCta: "Create your first project",
      clearFilters: "Show all",
      emptyArchived: "There are no archived projects right now.",
    },
    workspace: {
      back: "Back",
      documents: "Your docs",
      preview: "Preview",
      chat: "AI chat",
      upload: "Upload documents",
      filterAll: "Whole project",
      askPlaceholder: "Ask about your documents, a slide, or a concept...",
      send: "Send",
      processing: "Processing",
      ready: "Ready",
      queued: "Queued",
      error: "Error",
      noDocuments: "No documents uploaded to this project yet.",
      noPreview: "Select a document to see its preview.",
      noMessages: "Start by asking something about the project content.",
      scopeLabel: "Chat scope",
      citations: "Sources",
      mobileDocs: "Docs",
      mobilePreview: "Preview",
      mobileChat: "Chat",
      processingHint:
        "Office files and images are processed in the background and will appear here as soon as they are ready.",
      unsupportedPreview: "Preview will appear once the file conversion is ready.",
      switchProject: "Switch project",
      favorites: "Favorites",
      recent: "Recent",
      noProjects: "No more active projects.",
      editProject: "Edit project",
      documentsSearch: "Search",
      includedInChat: "Included in chat",
      addToChatScope: "Add to scope",
      selectedDocs: "docs selected",
      loadingPreview: "Loading preview...",
      noSubject: "No subject",
      createModeTitle: "New project",
      editModeTitle: "Edit project",
      createHint: "Create a new study space, set its look, and it will appear in recents immediately.",
      editHint: "Adjust the name, subject, description, or visual style without leaving the workspace.",
      name: "Project name",
      descriptionField: "Description",
      subject: "Subject",
      accentColor: "Visual style",
      projectIcon: "Symbol",
      colorPalette: "Palette",
      createCta: "Create project",
      saveChanges: "Save changes",
      cancelEdit: "Cancel",
      projectFallbackTitle: "Project",
      roleUser: "User",
      roleAssistant: "Assistant",
    },
    common: {
      loading: "Loading...",
      search: "Search",
      language: "Language",
      demo: "Demo",
      firebase: "Firebase",
      online: "Online",
      offline: "Not configured",
      notFoundTitle: "Page not found",
      notFoundDescription:
        "The requested route does not exist or the locale segment is invalid.",
    },
    errors: {
      authenticationFailed: "Authentication could not be completed.",
      unableToSyncSession: "Unable to sync session.",
      unableToLoadProjects: "Unable to load projects.",
      unableToSaveProject: "Unable to save project.",
      unableToUpdateProject: "Unable to update project.",
      unableToDeleteProject: "Unable to delete project.",
      unableToLoadProject: "Unable to load project.",
      unableToLoadMessages: "Unable to load messages.",
      unableToRefreshProject: "Unable to refresh project.",
      unableToLoadPreview: "Unable to load preview.",
      unableToUploadDocuments: "Unable to upload documents.",
      unableToSendMessage: "Unable to send message.",
      projectNotFound: "Project not found.",
      documentNotFound: "Document not found.",
      archiveBeforeDelete: "Archive the project before deleting it permanently.",
      unsupportedFileType: "Unsupported file type.",
      missingFiles: "Missing files.",
      unableToCreateSession: "Unable to create session.",
      missingAuthorization: "Missing authorization.",
      unableToLoadAsset: "Unable to load asset.",
      unableToGenerateAnswer: "Unable to generate answer.",
    },
  },
} as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
