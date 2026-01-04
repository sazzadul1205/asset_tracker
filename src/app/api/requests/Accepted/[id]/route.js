// src/app/api/requests/Accepted/[id]/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";
import { ObjectId } from "mongodb";
