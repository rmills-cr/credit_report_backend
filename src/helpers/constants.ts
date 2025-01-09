import dotenv from "dotenv";
dotenv.config();

export const salt_round = Number(process.env.SALT_ROUND);
export const port = process.env.PORT;
export const db_url = process.env.DATABASE_URL;
export const redis_url = process.env.REDIS_URL;
export const jwt_secret = process.env.JWT_SECRET;
export const jwt_lifetime = process.env.JWT_LIFETIME;
export const email_username = process.env.EMAIL_USERNAME;
export const email_passowrd = process.env.EMAIL_PASSWORD;
export const pass_phrase = process.env.PASSPHRASE;

const allowedOrigins = [
  "https://credit-repair-client.vercel.app",
  "http://localhost:3000",
  "http://localhost:4500",
];

export const CORS_OPTION = {
  origin: function (
    origin: string | undefined,
    callback: (error: Error | null, allow?: boolean) => void
  ) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  exposedHeaders: ["x-id-key"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "x-id-key",
  ],
  optionsSuccessStatus: 204,
};
