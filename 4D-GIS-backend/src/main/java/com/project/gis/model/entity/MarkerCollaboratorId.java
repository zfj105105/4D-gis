package com.project.gis.model.entity;

import lombok.Data;
import java.io.Serializable;

@Data
public class MarkerCollaboratorId implements Serializable
{
    private Long markerId;
    private Long userId;
}
