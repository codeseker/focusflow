import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { User } from "@/config/firebaseConfig";

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;

    // Make sure the code parameter is available
    if (!code) {
      return NextResponse.json(
        { error: "Code parameter is required" },
        { status: 400 }
      );
    }

    const resp = await axios({
      method: "POST",
      url: "https://api.notion.com/v1/oauth/token",
      auth: {
        username: process.env.NOTION_CLIENT_ID!,
        password: process.env.NOTION_CLIENT_SECRET!,
      },
      headers: { "Content-Type": "application/json" },
      data: { code, grant_type: "authorization_code" },
    });

    const userId = resp.data.owner.user.id;
    const notionResponse = await axios.post(
      "https://api.notion.com/v1/search",
      {
        filter: {
          property: "object",
          value: "page",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${resp.data.access_token}`,
          "Notion-Version": "2022-06-28",
        },
      }
    );

    const pageId = notionResponse.data.results[0].id;

    const userRef = await User.doc(userId);
    const singleUser = await userRef.get();

    if (singleUser.exists) {
      // Update the docs with the new page ID and access_token
      await userRef.update({
        page_id: pageId,
        access_token: resp.data.access_token,
      });

      const updatedUser = await userRef.get();
      // Return the updated user data
      return NextResponse.json(updatedUser.data());
    } else {
      // Save the new user with its page ID, user ID, and access token
      await userRef.set({
        page_id: pageId,
        access_token: resp.data.access_token,
        user_id: userId,
      });

      // Return the new user data
      return NextResponse.json({
        page_id: pageId,
        access_token: resp.data.access_token,
        user_id: userId,
      });
    }
  } catch (error) {
    console.error("Error in getToken:", error);
    return NextResponse.json(
      { error: "Failed to retrieve token or page ID" },
      { status: 500 }
    );
  }
}
