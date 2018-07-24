package fr.inra.urgi.rare.dao;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import fr.inra.urgi.rare.harvest.HarvestResult;
import org.springframework.stereotype.Component;

/**
 * Repository for {@link fr.inra.urgi.rare.harvest.HarvestResult}
 * @author JB Nizet
 */
@Component
public class HarvestResultRepository {

    private final Map<String, HarvestResult> fakeRepo = new ConcurrentHashMap<>();

    public void save(HarvestResult harvestResult) {
        this.fakeRepo.put(harvestResult.getId(), harvestResult);
    }

    public Optional<HarvestResult> findById(String id) {
        return Optional.ofNullable(fakeRepo.get(id));
    }
}
