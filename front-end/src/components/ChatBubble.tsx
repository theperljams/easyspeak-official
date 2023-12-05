interface ChatBubbleProps {
    side: "left" | "right";
    message: string;
}

export function ChatBubble ({ side, message }: ChatBubbleProps) {
	return (
		<div style={{
			display: "flex",
			flexDirection: "row",
			justifyContent: side === "left" ? "flex-start" : "flex-end",
			width: "100%",
		}}>
			<div
				style={{
					backgroundColor: side === "left" ? "#007AFF" : "#DCE7F9",
					color: side === "left" ? "#F2F2F2" : "#007AFF",
					borderRadius: "20px",
					margin: "0",
					maxWidth: "70%",
				}}>
				<p
					style={{
						margin: "10px",
						padding: "10px 0",
						textAlign: "center",
						fontSize: ".5em",

					}}>{message}</p>
			</div>
		</div>
	);
}
