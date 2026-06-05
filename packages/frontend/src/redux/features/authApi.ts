import { SignUpInput, AuthUserResponse, SignInInput, User } from "@logstream/shared";
import { api } from "../api";

export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        signUp: builder.mutation<AuthUserResponse, SignUpInput>({
            query: (body) => ({
                url: "/auth/sign-up",
                method: "POST",
                body,
            }),
            invalidatesTags: ["User", "Projects"],
        }),
        signIn: builder.mutation<AuthUserResponse, SignInInput>({
            query: (body) => ({
                url: "/auth/sign-in",
                method: "POST",
                body,
            }),
            invalidatesTags: ["User", "Projects"],
        }),
        signOut: builder.mutation<void, void>({
            query: () => ({
                url: "/auth/sign-out",
                method: "POST",
            }),
            invalidatesTags: ["User"],
        }),
        getProfile: builder.query<User, void>({
            query: () => "/auth/me",
            transformResponse: (response: AuthUserResponse) => response.user,
            providesTags: ["User"],
        }),
    }),
    overrideExisting: true,
})

export const { useSignUpMutation, useSignInMutation, useSignOutMutation, useGetProfileQuery } = authApi;