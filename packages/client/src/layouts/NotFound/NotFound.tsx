import { Button, Container, Group, Text, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";

export function NotFound() {
  // HOOKS
  const navigate = useNavigate();

  // DRAW
  return (
    <Container className="w-full h-full flex flex-col items-center justify-center gap-4">
      <div className="text-5xl font-bold mb-5">404</div>
      <Title>You have found a secret place.</Title>
      <Text c="dimmed" size="lg" ta="center" className="max-w-xl">
        Unfortunately, this is only a 404 page. You may have mistyped the
        address, or the page has been moved to another URL.
      </Text>
      <Group justify="center">
        <Button variant="light" size="md" onClick={() => navigate("/")}>
          Go back to dashboard
        </Button>
      </Group>
    </Container>
  );
}
