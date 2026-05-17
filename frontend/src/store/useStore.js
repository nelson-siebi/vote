import { create } from 'zustand';

const API_BASE = 'http://localhost:5000/api';

const useStore = create((set, get) => ({
  artists: [],
  isLoading: false,
  error: null,
  settings: {
    logo_text: "BeatVote",
    contact_phone: "+237 600 00 00 00",
    contact_email: "contact@beatvote.cm",
    facebook_url: "",
    instagram_url: "",
    announcement_text: "",
    announcement_active: false,
    popup_title: "",
    popup_content: "",
    popup_image: "",
    popup_link: "",
    popup_active: false
  },

  fetchArtists: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE}/artists`);
      const data = await res.json();
      if (data.success) {
        set({ artists: data.data, isLoading: false, error: null });
      } else {
        set({ error: data.message, isLoading: false });
      }
    } catch (err) {
      set({ error: "Erreur lors du chargement des artistes", isLoading: false });
    }
  },

  fetchSettings: async () => {
    try {
      const res = await fetch(`${API_BASE}/settings`);
      const data = await res.json();
      if (data.success && data.data) {
        set({ settings: { ...get().settings, ...data.data } });
      }
    } catch (err) {
      console.error("Settings load error", err);
    }
  },

  incrementView: async (artistId) => {
    // In our backend, GET /artists/:id already increments views.
    // So we just fetch the artist details if needed, or do nothing if handled by navigation.
  }
}));

export default useStore;
