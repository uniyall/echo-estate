package handlers

func errResponse(msg string) map[string]string {
	return map[string]string{"error": msg}
}
