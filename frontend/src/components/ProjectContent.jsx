import NotesSection from "./NotesSection";
import LinksSection from "./LinksSection";
import FilesSection from "./FilesSection";
import AIChatSection from "./AIChatSection";

export default function ProjectContent({ project, onUpdate }) {
  return (
    <div className="project-content">
      <NotesSection
        notes={project.notas}
        onUpdate={(notes) => onUpdate({ ...project, notas: notes })}
      />
      <LinksSection
        links={project.links}
        onUpdate={(links) => onUpdate({ ...project, links: links })}
      />
      <FilesSection
        files={project.archivos}
        onUpdate={(files) => onUpdate({ ...project, archivos: files })}
      />
      <AIChatSection project={project} />
    </div>
  );
}
