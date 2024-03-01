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
exports.getContextShort = exports.getContextLong = exports.getContextAll = exports.insertQAPair = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
if (!SUPABASE_URL || !SUPABASE_API_KEY) {
    throw new Error('Supabase URL and API Key must be set in environment variables.');
}
const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_API_KEY);
const SIMILARITY_THRESHOLD = 0.1;
const MATCH_COUNT = 10;
const insertQAPair = (user_id, content, embedding, table_name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield supabase.from(table_name).insert({
            user_id,
            content,
            embedding
        });
    }
    catch (error) {
        console.error('Error inserting QA pair into Supabase:', error);
    }
});
exports.insertQAPair = insertQAPair;
const getContextAll = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data: longData, error: longError } = yield supabase
            .from('long')
            .select('*')
            .eq('user_id', user_id);
        const { data: shortData, error: shortError } = yield supabase
            .from('short')
            .select('*')
            .eq('user_id', user_id);
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
exports.getContextAll = getContextAll;
const getContextLong = (embedding, user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield supabase.rpc('match_long', {
            match_count: MATCH_COUNT,
            query_embedding: embedding,
            similarity_threshold: SIMILARITY_THRESHOLD,
            userid: user_id
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
exports.getContextLong = getContextLong;
const getContextShort = (embedding, user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield supabase.rpc('match_short', {
            match_count: MATCH_COUNT,
            query_embedding: embedding,
            similarity_threshold: SIMILARITY_THRESHOLD,
            userid: user_id
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
exports.getContextShort = getContextShort;
//# sourceMappingURL=db.js.map