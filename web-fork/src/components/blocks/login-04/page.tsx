import { LoginForm } from "@components/blocks/login-04/login-form";
import { ThemeToggle } from "@components/ThemeToggle";

export default function LoginPage() {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
            <div className="absolute top-4 left-4">
                <ThemeToggle />
            </div>
            <div className="w-full max-w-sm md:max-w-4xl">
                <LoginForm />
            </div>
        </div>
    );
}
