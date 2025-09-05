import cv2
import numpy as np
from ultralytics import YOLO
import time
import os

class WebcamDetector:
    def __init__(self, model_path='yolov8n.pt', conf_threshold=0.5):
        """
        Initialize the WebcamDetector
        
        Args:
            model_path (str): Path to YOLO model
            conf_threshold (float): Confidence threshold for detections
        """
        print("Loading YOLO model...")
        self.model = YOLO(model_path)
        self.conf_threshold = conf_threshold
        self.cap = None
        self.fps = 0
        self.prev_time = time.time()
        self.frame_count = 0
        
        # Detection statistics
        self.total_detections = 0
        self.detected_objects = {}
        
    def initialize_camera(self, camera_index=0):
        """Initialize camera capture"""
        self.cap = cv2.VideoCapture(camera_index)
        
        if not self.cap.isOpened():
            raise ValueError(f"Unable to access camera {camera_index}")
        
        # Set camera properties for better performance
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        self.cap.set(cv2.CAP_PROP_FPS, 30)
        
        print(f"Camera {camera_index} initialized successfully!")
        return True
    
    def calculate_fps(self):
        """Calculate current FPS"""
        current_time = time.time()
        if self.prev_time != 0:
            self.fps = 1.0 / (current_time - self.prev_time)
        self.prev_time = current_time
        
    def update_statistics(self, results):
        """Update detection statistics"""
        if results[0].boxes is not None:
            for box in results[0].boxes:
                class_id = int(box.cls.cpu().numpy()[0])
                class_name = self.model.names[class_id]
                confidence = float(box.conf.cpu().numpy()[0])
                
                if confidence >= self.conf_threshold:
                    self.total_detections += 1
                    if class_name in self.detected_objects:
                        self.detected_objects[class_name] += 1
                    else:
                        self.detected_objects[class_name] = 1
    
    def draw_info_panel(self, frame):
        """Draw information panel on frame"""
        height, width = frame.shape[:2]
        
        # Create semi-transparent overlay
        overlay = frame.copy()
        cv2.rectangle(overlay, (10, 10), (400, 150), (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)
        
        # Draw text information
        font = cv2.FONT_HERSHEY_SIMPLEX
        cv2.putText(frame, f'FPS: {self.fps:.1f}', (20, 35), font, 0.6, (0, 255, 0), 2)
        cv2.putText(frame, f'Frame: {self.frame_count}', (20, 55), font, 0.6, (255, 255, 255), 1)
        cv2.putText(frame, f'Total Detections: {self.total_detections}', (20, 75), font, 0.6, (255, 255, 255), 1)
        cv2.putText(frame, f'Confidence: {self.conf_threshold}', (20, 95), font, 0.6, (255, 255, 255), 1)
        
        # Draw controls
        cv2.putText(frame, 'Controls:', (20, 120), font, 0.5, (255, 255, 0), 1)
        cv2.putText(frame, 'Q: Quit | S: Screenshot | R: Reset Stats', (20, 140), font, 0.4, (255, 255, 0), 1)
        
        return frame
    
    def save_screenshot(self, frame):
        """Save current frame as screenshot"""
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        filename = f"detection_screenshot_{timestamp}.jpg"
        cv2.imwrite(filename, frame)
        print(f"Screenshot saved: {filename}")
    
    def reset_statistics(self):
        """Reset detection statistics"""
        self.total_detections = 0
        self.detected_objects = {}
        print("Statistics reset!")
    
    def detect_realtime(self, show_info=True):
        """
        Run real-time object detection
        
        Args:
            show_info (bool): Whether to show info panel
        """
        if self.cap is None:
            self.initialize_camera()
        
        print("Starting real-time detection...")
        print("Press 'Q' to quit, 'S' for screenshot, 'R' to reset stats")
        
        try:
            while True:
                ret, frame = self.cap.read()
                if not ret:
                    print("Failed to grab frame")
                    break
                
                self.frame_count += 1
                
                # Run YOLO detection
                results = self.model(frame, conf=self.conf_threshold, verbose=False)
                
                # Draw detection results
                annotated_frame = results[0].plot()
                
                # Update statistics
                self.update_statistics(results)
                
                # Calculate FPS
                self.calculate_fps()
                
                # Draw info panel if requested
                if show_info:
                    annotated_frame = self.draw_info_panel(annotated_frame)
                
                # Display frame
                cv2.imshow('AI Vision Detection - Live Webcam', annotated_frame)
                
                # Handle key presses
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q') or key == ord('Q'):
                    break
                elif key == ord('s') or key == ord('S'):
                    self.save_screenshot(annotated_frame)
                elif key == ord('r') or key == ord('R'):
                    self.reset_statistics()
                elif key == ord('c') or key == ord('C'):
                    # Toggle confidence threshold
                    self.conf_threshold = 0.3 if self.conf_threshold == 0.5 else 0.5
                    print(f"Confidence threshold changed to: {self.conf_threshold}")
        
        except KeyboardInterrupt:
            print("\nStopping detection...")
        
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Clean up resources"""
        if self.cap is not None:
            self.cap.release()
        cv2.destroyAllWindows()
        
        # Print final statistics
        print(f"\nFinal Statistics:")
        print(f"Total Detections: {self.total_detections}")
        print(f"Objects Detected:")
        for obj, count in self.detected_objects.items():
            print(f"  {obj}: {count}")
        
        print("Webcam detection stopped.")

def main():
    """Main function to run webcam detection"""
    print("AI Vision Detection - Webcam Mode")
    print("=" * 40)
    
    try:
        # Initialize detector
        detector = WebcamDetector(conf_threshold=0.5)
        
        # Start detection
        detector.detect_realtime()
        
    except Exception as e:
        print(f"Error: {e}")
        print("Make sure your webcam is connected and not being used by another application.")

if __name__ == "__main__":
    main()