// ==========================================
// STORAGE SERVICE - SUPABASE MIGRATION LAYER
// Replaces local storage with Supabase PostgreSQL
// ==========================================

import { supabaseStorage } from './supabaseStorage';

// Purge any residual local storage keys immediately
supabaseStorage.purgeLegacyLocalStorage();

export { supabaseStorage as storage };
export default supabaseStorage;
