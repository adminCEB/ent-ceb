import { createClient } from '@supabase/supabase-js';

    const supabaseUrl = "https://locrqmwmcsbolynuiuka.supabase.co"; 
    const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY3JxbXdtY3Nib2x5bnVpdWthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMTI3ODksImV4cCI6MjA2Mzc4ODc4OX0.1WI7IoMNg_6bWNUuz9Wt07OtgSwMaoHT5cyYpprXxmQ"; 

    let supabaseInstance = null;

    if (supabaseUrl && supabaseAnonKey) {
      try {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
        console.log("Supabase client initialized successfully.");
      } catch (error) {
        console.error("Error initializing Supabase client:", error);
        supabaseInstance = null; 
        alert("Erreur critique: Impossible d'initialiser la connexion à la base de données. Certaines fonctionnalités seront indisponibles. Veuillez contacter le support.");
      }
    } else {
      console.warn("Supabase URL or Anon Key is not provided. Supabase client not initialized. Application will run in offline/demo mode.");
      supabaseInstance = {
        auth: {
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: "Supabase is not configured." } }),
          signUp: async () => ({ data: { user: null, session: null }, error: { message: "Supabase is not configured." } }),
          signOut: async () => ({ error: null }),
          resetPasswordForEmail: async () => ({ data: {}, error: { message: "Supabase is not configured." } }),
          updateUser: async () => ({ data: { user: null }, error: { message: "Supabase is not configured." } }),
        },
        from: (tableName) => ({
          select: async () => ({ data: [], error: { message: `Supabase is not configured. Table: ${tableName}` } }),
          insert: async () => ({ data: [], error: { message: `Supabase is not configured. Table: ${tableName}` } }),
          update: async () => ({ data: [], error: { message: `Supabase is not configured. Table: ${tableName}` } }),
          delete: async () => ({ data: [], error: { message: `Supabase is not configured. Table: ${tableName}` } }),
          eq: function() { return this; },
          neq: function() { return this; },
          gt: function() { return this; },
          gte: function() { return this; },
          lt: function() { return this; },
          lte: function() { return this; },
          like: function() { return this; },
          in: function() { return this; },
          is: function() { return this; },
          order: function() { return this; },
          limit: function() { return this; },
          range: function() { return this; },
          single: async () => ({ data: null, error: { message: `Supabase is not configured. Table: ${tableName}` } }),
        }),
        storage: {
            from: (bucketName) => ({
                upload: async () => ({ data: null, error: { message: `Supabase storage is not configured. Bucket: ${bucketName}` } }),
                download: async () => ({ data: null, error: { message: `Supabase storage is not configured. Bucket: ${bucketName}` } }),
                remove: async () => ({ data: null, error: { message: `Supabase storage is not configured. Bucket: ${bucketName}` } }),
                list: async () => ({ data: [], error: { message: `Supabase storage is not configured. Bucket: ${bucketName}` } }),
                getPublicUrl: () => ({ data: { publicUrl: '' } }),
            }),
        },
      };
    }

    export const supabase = supabaseInstance;