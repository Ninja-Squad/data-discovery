package fr.inra.urgi.datadiscovery.germplasm;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.dao.AggregationAnalyzer;
import fr.inra.urgi.datadiscovery.dao.SearchRefinements;
import fr.inra.urgi.datadiscovery.dao.faidare.FaidareAggregation;
import fr.inra.urgi.datadiscovery.dao.faidare.FaidareDocumentDao;
import fr.inra.urgi.datadiscovery.germplasm.api.ExportFormat;
import fr.inra.urgi.datadiscovery.germplasm.api.FaidareApiService;
import fr.inra.urgi.datadiscovery.germplasm.api.GermplasmExportCommand;
import fr.inra.urgi.datadiscovery.germplasm.api.GermplasmMcpdExportCommand;
import fr.inra.urgi.datadiscovery.germplasm.api.GermplasmMiappeExportCommand;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferFactory;
import org.springframework.core.io.buffer.DefaultDataBufferFactory;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import reactor.core.publisher.Flux;

/**
 * MVC tests for {@link ExportController}
 *
 * @author JB Nizet
 */
@WebMvcTest(ExportController.class)
@ActiveProfiles(AppProfile.FAIDARE)
class ExportControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FaidareApiService mockFaidareApiService;

    @MockitoBean
    private FaidareDocumentDao mockFaidareDocumentDao;

    @MockitoBean
    private AggregationAnalyzer mockAggregationAnalyzer;

    @BeforeEach
    void prepare() {
        when(mockAggregationAnalyzer.getAggregations()).thenReturn(Arrays.asList(FaidareAggregation.values()));
    }

    @Test
    void shouldThrowIfNoEntryTypeAggregation() throws Exception {
        mockMvc.perform(get("/api/germplasms/exports/mcpd"))
               .andExpect(status().isBadRequest());
    }

    @Test
    void shouldThrowIfEntryTypeAggregationWithMoreThanGermplasm() throws Exception {
        mockMvc.perform(get("/api/germplasms/exports/mcpd")
                            .param(FaidareAggregation.ENTRY_TYPE.getName(), "foo")
                            .param(FaidareAggregation.ENTRY_TYPE.getName(), "Germplasm"))
               .andExpect(status().isBadRequest());
    }

    @Test
    void shouldExportMcpds() throws Exception {
        HashSet<String> expectedIds = new HashSet<>(Arrays.asList("a", "b"));
        GermplasmMcpdExportCommand expectedCommand = new GermplasmMcpdExportCommand(expectedIds, Collections.emptyList());
        when(mockFaidareDocumentDao.findAllIds("something",
                                               false,
                                               SearchRefinements.builder()
                                                                .withTerm(FaidareAggregation.COUNTRY_OF_ORIGIN, Collections.singletonList("France"))
                                                                .withTerm(FaidareAggregation.ENTRY_TYPE, Collections.singletonList("Germplasm"))
                                                                .build(),
                                            "germplasmDbId")
        ).thenReturn(expectedIds);

        DataBufferFactory dataBufferFactory = new DefaultDataBufferFactory();
        when(mockFaidareApiService.exportMcpd(expectedCommand)).thenReturn(
            Flux.fromArray(new DataBuffer[] {
                dataBufferFactory.wrap("A;B;C\n".getBytes(StandardCharsets.UTF_8)),
                dataBufferFactory.wrap("a1;b1;c1\n".getBytes(StandardCharsets.UTF_8)),
                dataBufferFactory.wrap("a2;b2;c2\n".getBytes(StandardCharsets.UTF_8))
            })
        );

        MvcResult mvcResult = mockMvc.perform(get("/api/germplasms/exports/mcpd")
                                                  .param("query", "something")
                                                  .param(FaidareAggregation.COUNTRY_OF_ORIGIN.getName(), "France")
                                                  .param(FaidareAggregation.ENTRY_TYPE.getName(), "Germplasm"))
                                     .andExpect(request().asyncStarted())
                                     .andReturn();
        mockMvc.perform(asyncDispatch(mvcResult))
               .andExpect(status().isOk())
               .andExpect(content().contentType(ExportFormat.CSV.getMediaType()))
               .andExpect(content().string("A;B;C\na1;b1;c1\na2;b2;c2\n"));
    }

    @Test
    void shouldExportPlantMaterial() throws Exception {
        HashSet<String> expectedIds = new HashSet<>(Arrays.asList("a", "b"));
        GermplasmExportCommand expectedCommand = new GermplasmExportCommand(expectedIds, Collections.emptyList());
        when(mockFaidareDocumentDao.findAllIds("something",
                                               false,
                                               SearchRefinements.builder()
                                                                .withTerm(FaidareAggregation.COUNTRY_OF_ORIGIN, Collections.singletonList("France"))
                                                                .withTerm(FaidareAggregation.ENTRY_TYPE, Collections.singletonList("Germplasm"))
                                                                .build(),
                                    "germplasmDbId")
        ).thenReturn(expectedIds);

        DataBufferFactory dataBufferFactory = new DefaultDataBufferFactory();
        when(mockFaidareApiService.exportPlantMaterial(expectedCommand)).thenReturn(
            Flux.fromArray(new DataBuffer[] {
                dataBufferFactory.wrap("A;B;C\n".getBytes(StandardCharsets.UTF_8)),
                dataBufferFactory.wrap("a1;b1;c1\n".getBytes(StandardCharsets.UTF_8)),
                dataBufferFactory.wrap("a2;b2;c2\n".getBytes(StandardCharsets.UTF_8))
            })
        );

        MvcResult mvcResult = mockMvc.perform(get("/api/germplasms/exports/plant-material")
                                                  .param("query", "something")
                                                  .param(FaidareAggregation.COUNTRY_OF_ORIGIN.getName(), "France")
                                                  .param(FaidareAggregation.ENTRY_TYPE.getName(), "Germplasm"))
                                     .andExpect(request().asyncStarted())
                                     .andReturn();
        mockMvc.perform(asyncDispatch(mvcResult))
               .andExpect(status().isOk())
               .andExpect(content().contentType(ExportFormat.CSV.getMediaType()))
               .andExpect(content().string("A;B;C\na1;b1;c1\na2;b2;c2\n"));
    }

    @Test
    void shouldExportMiappe() throws Exception {
        HashSet<String> expectedIds = new HashSet<>(Arrays.asList("a", "b"));
        GermplasmMiappeExportCommand expectedCommand = new GermplasmMiappeExportCommand(expectedIds, ExportFormat.CSV);
        when(mockFaidareDocumentDao.findAllIds("something",
                                               false,
                                               SearchRefinements.builder()
                                                                .withTerm(FaidareAggregation.COUNTRY_OF_ORIGIN, Collections.singletonList("France"))
                                                                .withTerm(FaidareAggregation.ENTRY_TYPE, Collections.singletonList("Germplasm"))
                                                                .build(),
                                               "germplasmDbId")
        ).thenReturn(expectedIds);

        DataBufferFactory dataBufferFactory = new DefaultDataBufferFactory();
        when(mockFaidareApiService.exportMiappe(expectedCommand)).thenReturn(
            Flux.fromArray(new DataBuffer[] {
                dataBufferFactory.wrap("A;B;C\n".getBytes(StandardCharsets.UTF_8)),
                dataBufferFactory.wrap("a1;b1;c1\n".getBytes(StandardCharsets.UTF_8)),
                dataBufferFactory.wrap("a2;b2;c2\n".getBytes(StandardCharsets.UTF_8))
            })
        );

        MvcResult mvcResult = mockMvc.perform(get("/api/germplasms/exports/miappe")
                                                  .param("query", "something")
                                                  .param("format", ExportFormat.CSV.name())
                                                  .param(FaidareAggregation.COUNTRY_OF_ORIGIN.getName(), "France")
                                                  .param(FaidareAggregation.ENTRY_TYPE.getName(), "Germplasm"))
                                     .andExpect(request().asyncStarted())
                                     .andReturn();
        mockMvc.perform(asyncDispatch(mvcResult))
               .andExpect(status().isOk())
               .andExpect(content().contentType(ExportFormat.CSV.getMediaType()))
               .andExpect(content().string("A;B;C\na1;b1;c1\na2;b2;c2\n"));
    }
}
