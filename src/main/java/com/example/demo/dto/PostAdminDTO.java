package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostAdminDTO {
    private Long id;
    private String content;
    private String authorNickname;
    private String topicName;
    private String topicCode;
    private LocalDateTime createdAt;
    private List<PostImageAdminDTO> images;

    public String getImagesJson() {
        if (images == null || images.isEmpty()) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < images.size(); i++) {
            PostImageAdminDTO img = images.get(i);
            sb.append("{")
                    .append("\"url\":\"").append(img.getUrl()).append("\",")
                    .append("\"likes\":").append(img.getLikes()).append(",")
                    .append("\"comments\":").append(img.getComments())
                    .append("}");
            if (i < images.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }
}
