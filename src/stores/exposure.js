// src/stores/exposure.js
import { defineStore } from "pinia";
import { db } from "../firebase/config";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

export const useExposureStore = defineStore("exposure", {
  state: () => ({
    categories: [], // [{ id, name, order, exposures: [{ id, title, difficulty, order, logs: [] }] }]
    loading: false,
  }),

  getters: {
    sortedCategories: (state) =>
      [...state.categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  },

  actions: {
    // ═════ Helpers ═════
    _catCol(uid) {
      return collection(db, "users", uid, "exposureCategories");
    },
    _catDoc(uid, catId) {
      return doc(db, "users", uid, "exposureCategories", catId);
    },
    _expCol(uid, catId) {
      return collection(db, "users", uid, "exposureCategories", catId, "exposures");
    },
    _expDoc(uid, catId, expId) {
      return doc(db, "users", uid, "exposureCategories", catId, "exposures", expId);
    },
    _logCol(uid, catId, expId) {
      return collection(db, "users", uid, "exposureCategories", catId, "exposures", expId, "logs");
    },
    _logDoc(uid, catId, expId, logId) {
      return doc(db, "users", uid, "exposureCategories", catId, "exposures", expId, "logs", logId);
    },

    // ═════ Load everything ═════
    async loadAll(uid) {
      if (!uid) return;
      this.loading = true;

      try {
        const catSnap = await getDocs(query(this._catCol(uid), orderBy("order")));
        const cats = [];

        for (const catDoc of catSnap.docs) {
          const catData = catDoc.data();
          const cat = { id: catDoc.id, ...catData, exposures: [] };

          const expSnap = await getDocs(query(this._expCol(uid, catDoc.id), orderBy("order")));

          for (const expDoc of expSnap.docs) {
            const expData = expDoc.data();
            const exp = { id: expDoc.id, ...expData, logs: [] };

            const logSnap = await getDocs(this._logCol(uid, catDoc.id, expDoc.id));
            exp.logs = logSnap.docs
              .map((l) => ({ id: l.id, ...l.data() }))
              .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

            cat.exposures.push(exp);
          }

          cats.push(cat);
        }

        this.categories = cats;
      } finally {
        this.loading = false;
      }
    },

    // ═════ Categories CRUD ═════
    async addCategory(uid, name) {
      const id = `cat_${Date.now()}`;
      const payload = {
        name: name.trim(),
        order: this.categories.length,
        createdAt: serverTimestamp(),
      };
      await setDoc(this._catDoc(uid, id), payload);
      this.categories.push({ id, ...payload, exposures: [] });
    },

    async updateCategory(uid, catId, name) {
      await setDoc(this._catDoc(uid, catId), { name: name.trim() }, { merge: true });
      const cat = this.categories.find((c) => c.id === catId);
      if (cat) cat.name = name.trim();
    },

    async deleteCategory(uid, catId) {
      // Delete all exposures + logs inside first
      const cat = this.categories.find((c) => c.id === catId);
      if (cat) {
        for (const exp of cat.exposures) {
          for (const log of exp.logs) {
            await deleteDoc(this._logDoc(uid, catId, exp.id, log.id));
          }
          await deleteDoc(this._expDoc(uid, catId, exp.id));
        }
      }
      await deleteDoc(this._catDoc(uid, catId));
      this.categories = this.categories.filter((c) => c.id !== catId);
    },

    // ═════ Exposures CRUD ═════
    async addExposure(uid, catId, title, difficulty) {
      const cat = this.categories.find((c) => c.id === catId);
      if (!cat) return;

      const id = `exp_${Date.now()}`;
      const payload = {
        title: title.trim(),
        difficulty: Number(difficulty),
        order: cat.exposures.length,
        createdAt: serverTimestamp(),
      };
      await setDoc(this._expDoc(uid, catId, id), payload);
      cat.exposures.push({ id, ...payload, logs: [] });
    },

    async updateExposure(uid, catId, expId, title, difficulty) {
      await setDoc(
        this._expDoc(uid, catId, expId),
        { title: title.trim(), difficulty: Number(difficulty) },
        { merge: true },
      );
      const cat = this.categories.find((c) => c.id === catId);
      const exp = cat?.exposures.find((e) => e.id === expId);
      if (exp) {
        exp.title = title.trim();
        exp.difficulty = Number(difficulty);
      }
    },

    async deleteExposure(uid, catId, expId) {
      const cat = this.categories.find((c) => c.id === catId);
      const exp = cat?.exposures.find((e) => e.id === expId);
      if (exp) {
        for (const log of exp.logs) {
          await deleteDoc(this._logDoc(uid, catId, expId, log.id));
        }
      }
      await deleteDoc(this._expDoc(uid, catId, expId));
      if (cat) {
        cat.exposures = cat.exposures.filter((e) => e.id !== expId);
      }
    },

    // ═════ Logs CRUD ═════
    async addLog(uid, catId, expId, date, feltDifficulty, comment) {
      const cat = this.categories.find((c) => c.id === catId);
      const exp = cat?.exposures.find((e) => e.id === expId);
      if (!exp) return;

      const id = `log_${Date.now()}`;
      const payload = {
        date,
        feltDifficulty: Number(feltDifficulty),
        comment: (comment || "").trim(),
        createdAt: serverTimestamp(),
      };
      await setDoc(this._logDoc(uid, catId, expId, id), payload);
      exp.logs.unshift({ id, ...payload });
    },

    async deleteLog(uid, catId, expId, logId) {
      await deleteDoc(this._logDoc(uid, catId, expId, logId));
      const cat = this.categories.find((c) => c.id === catId);
      const exp = cat?.exposures.find((e) => e.id === expId);
      if (exp) {
        exp.logs = exp.logs.filter((l) => l.id !== logId);
      }
    },

    // ═════ Getters helpers ═════
    getCategory(catId) {
      return this.categories.find((c) => c.id === catId);
    },

    getExposure(catId, expId) {
      const cat = this.getCategory(catId);
      return cat?.exposures.find((e) => e.id === expId);
    },
  },
});
