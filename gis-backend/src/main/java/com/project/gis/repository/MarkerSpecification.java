package com.project.gis.repository;

import com.project.gis.dto.MarkerFilter;
import com.project.gis.model.entity.Marker;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class MarkerSpecification {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public static Specification<Marker> visibleForUser(Long userId) {
        return (root, query, cb) -> cb.or(
                cb.equal(root.get("visibility"), "all_can_see"),
                cb.equal(root.get("creator").get("id"), userId),
                cb.equal(root.get("owner").get("id"), userId)
        );
    }

    public static Specification<Marker> byFilter(MarkerFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> preds = new ArrayList<>();

            if (filter == null) return cb.and(preds.toArray(new Predicate[0]));

            if (filter.getTimeStart() != null && !filter.getTimeStart().isBlank()) {
                LocalDateTime ts = LocalDateTime.parse(filter.getTimeStart(), FMT);
                preds.add(cb.greaterThanOrEqualTo(root.get("startTime"), ts));
            }

            if (filter.getTimeEnd() != null && !filter.getTimeEnd().isBlank()) {
                LocalDateTime te = LocalDateTime.parse(filter.getTimeEnd(), FMT);
                preds.add(cb.lessThanOrEqualTo(root.get("endTime"), te));
            }

            if (filter.getMinHeight() != null) {
                preds.add(cb.greaterThanOrEqualTo(root.get("altitude"), filter.getMinHeight()));
            }

            if (filter.getMaxHeight() != null) {
                preds.add(cb.lessThanOrEqualTo(root.get("altitude"), filter.getMaxHeight()));
            }

            if (filter.getType() != null) {
                preds.add(cb.equal(root.get("markerType").get("id"), filter.getType()));
            }

            if (filter.getKeyword() != null && !filter.getKeyword().isBlank()) {
                String like = "%" + filter.getKeyword().toLowerCase() + "%";
                Expression<String> titleLower = cb.lower(root.get("title"));
                Expression<String> descLower = cb.lower(root.get("description"));
                preds.add(cb.or(cb.like(titleLower, like), cb.like(descLower, like)));
            }

            return cb.and(preds.toArray(new Predicate[0]));
        };
    }
}
