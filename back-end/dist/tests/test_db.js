"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContext = exports.getPearlContextAll = exports.getPearlAllShort = exports.getPearlAllLong = exports.getPearlContextShort = exports.getPearlContextLong = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
if (!SUPABASE_URL || !SUPABASE_API_KEY) {
    throw new Error('Supabase URL and API Key must be set in environment variables.');
}
const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_API_KEY);
const SIMILARITY_THRESHOLD = 0.9;
const MATCH_COUNT = 15;
const getPearlContextLong = (embedding) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield supabase.rpc('match_pearl_long', {
            match_count: MATCH_COUNT,
            query_embedding: embedding,
            similarity_threshold: SIMILARITY_THRESHOLD
        });
        let result = [];
        for (const i in data)
            result.push(data[i].content);
        return result;
    }
    catch (error) {
        throw error;
    }
});
exports.getPearlContextLong = getPearlContextLong;
const getPearlContextShort = (embedding) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield supabase.rpc('match_pearl_short', {
            match_count: MATCH_COUNT,
            query_embedding: embedding,
            similarity_threshold: SIMILARITY_THRESHOLD
        });
        let result = [];
        for (const i in data)
            result.push(data[i].content);
        return result;
    }
    catch (error) {
        throw error;
    }
});
exports.getPearlContextShort = getPearlContextShort;
const getPearlAllLong = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data: longData, error: longError } = yield supabase
            .from('pearl_long_form')
            .select('*');
        if (longError) {
            throw new Error('Error fetching data from Supabase');
        }
        let result = [];
        for (const j in longData)
            result.push(longData[j].content);
        return result;
    }
    catch (error) {
        throw error;
    }
});
exports.getPearlAllLong = getPearlAllLong;
const getPearlAllShort = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data: shortData, error: shortError } = yield supabase
            .from('pearl_short_form')
            .select('*');
        if (shortError) {
            throw new Error('Error fetching data from Supabase');
        }
        let result = [];
        for (const i in shortData)
            result.push(shortData[i].content);
        return result;
    }
    catch (error) {
        throw error;
    }
});
exports.getPearlAllShort = getPearlAllShort;
const getPearlContextAll = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data: longData, error: longError } = yield supabase
            .from('pearl_long_form')
            .select('*');
        const { data: shortData, error: shortError } = yield supabase
            .from('pearl_short_form')
            .select('*');
        if (longError || shortError) {
            throw new Error('Error fetching data from Supabase');
        }
        let result = [];
        for (const i in shortData)
            result.push(shortData[i].content);
        for (const j in longData)
            result.push(longData[j].content);
        return result;
    }
    catch (error) {
        throw error;
    }
});
exports.getPearlContextAll = getPearlContextAll;
const getContext = (embedding, match_count, similarity_threshold) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield supabase.rpc('match_pearlxcamille', {
            match_count: match_count,
            query_embedding: embedding,
            similarity_threshold: similarity_threshold
        });
        let result = [];
        for (const i in data)
            result.push(data[i].content);
        return result;
    }
    catch (error) {
        throw error;
    }
});
exports.getContext = getContext;
//# sourceMappingURL=test_db.js.map